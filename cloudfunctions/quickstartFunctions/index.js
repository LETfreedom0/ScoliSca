const cloud = require("wx-server-sdk");
const axios = require("axios");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const LLM_CONFIG = {
  OPENAI: {
    apiKey: process.env.OPENAI_API_KEY || "your-api-key",
    baseURL: "https://api.openai.com/v1",
    model: "gpt-3.5-turbo",
  },
  DOUBAO: {
    apiKey: process.env.DOUBAO_API_KEY || "your-api-key",
    secretKey: process.env.DOUBAO_SECRET_KEY || "your-secret-key",
    model: "ERNIE-Bot",
  },
};

const db = cloud.database();
// 获取openid
const getOpenId = async () => {
  // 获取基础信息
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 获取小程序二维码
const getMiniProgramCode = async () => {
  // 获取小程序二维码的buffer
  const resp = await cloud.openapi.wxacode.get({
    path: "pages/index/index",
  });
  const { buffer } = resp;
  // 将图片上传云存储空间
  const upload = await cloud.uploadFile({
    cloudPath: "code.png",
    fileContent: buffer,
  });
  return upload.fileID;
};

// 创建集合
const createCollection = async () => {
  try {
    // 创建集合
    await db.createCollection("sales");
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华东",
        city: "上海",
        sales: 11,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华东",
        city: "南京",
        sales: 11,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华南",
        city: "广州",
        sales: 22,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华南",
        city: "深圳",
        sales: 22,
      },
    });
    return {
      success: true,
    };
  } catch (e) {
    // 这里catch到的是该collection已经存在，从业务逻辑上来说是运行成功的，所以catch返回success给前端，避免工具在前端抛出异常
    return {
      success: true,
      data: "create collection success",
    };
  }
};

// 查询数据
const selectRecord = async () => {
  // 返回数据库查询结果
  return await db.collection("sales").get();
};

// 更新数据
const updateRecord = async (event) => {
  try {
    // 遍历修改数据库信息
    for (let i = 0; i < event.data.length; i++) {
      await db
        .collection("sales")
        .where({
          _id: event.data[i]._id,
        })
        .update({
          data: {
            sales: event.data[i].sales,
          },
        });
    }
    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 新增数据
const insertRecord = async (event) => {
  try {
    const insertRecord = event.data;
    // 插入数据
    await db.collection("sales").add({
      data: {
        region: insertRecord.region,
        city: insertRecord.city,
        sales: Number(insertRecord.sales),
      },
    });
    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 删除数据
const deleteRecord = async (event) => {
  try {
    await db
      .collection("sales")
      .where({
        _id: event.data._id,
      })
      .remove();
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 调用OpenAI大模型
const callOpenAI = async (event) => {
  try {
    const { message, model = LLM_CONFIG.OPENAI.model } = event.data;
    const response = await axios.post(
      `${LLM_CONFIG.OPENAI.baseURL}/chat/completions`,
      {
        model: model,
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${LLM_CONFIG.OPENAI.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return {
      success: true,
      data: response.data.choices[0].message.content,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.response?.data || e.message,
    };
  }
};

// 调用豆包大模型
const callDoubao = async (event) => {
  try {
    const { message } = event.data;
    const tokenResponse = await axios.post(
      "https://aip.baidubce.com/oauth/2.0/token",
      null,
      {
        params: {
          grant_type: "client_credentials",
          client_id: LLM_CONFIG.DOUBAO.apiKey,
          client_secret: LLM_CONFIG.DOUBAO.secretKey,
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;
    const response = await axios.post(
      "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
      {
        messages: [{ role: "user", content: message }],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { access_token: accessToken },
      }
    );
    return {
      success: true,
      data: response.data.result,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.response?.data || e.message,
    };
  }
};

// 通用大模型调用接口
const callLLM = async (event) => {
  const { provider = "openai" } = event.data;
  switch (provider.toLowerCase()) {
    case "openai":
      return await callOpenAI(event);
    case "doubao":
      return await callDoubao(event);
    default:
      return {
        success: false,
        errMsg: "Unsupported LLM provider",
      };
  }
};

// const getOpenId = require('./getOpenId/index');
// const getMiniProgramCode = require('./getMiniProgramCode/index');
// const createCollection = require('./createCollection/index');
// const selectRecord = require('./selectRecord/index');
// const updateRecord = require('./updateRecord/index');
// const fetchGoodsList = require('./fetchGoodsList/index');
// const genMpQrcode = require('./genMpQrcode/index');
// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case "getOpenId":
      return await getOpenId();
    case "getMiniProgramCode":
      return await getMiniProgramCode();
    case "createCollection":
      return await createCollection();
    case "selectRecord":
      return await selectRecord();
    case "updateRecord":
      return await updateRecord(event);
    case "insertRecord":
      return await insertRecord(event);
    case "deleteRecord":
      return await deleteRecord(event);
    case "callLLM":
      return await callLLM(event);
    case "callOpenAI":
      return await callOpenAI(event);
    case "callDoubao":
      return await callDoubao(event);
  }
};
