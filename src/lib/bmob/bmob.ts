// 导出 Bmob 实例
import Bmob from 'hydrogen-js-sdk'

// 从环境变量获取Bmob配置
const BMOB_APPLICATION_ID = import.meta.env.VITE_BMOB_APPLICATION_ID;
const BMOB_REST_API_KEY = import.meta.env.VITE_BMOB_REST_API_KEY;

// 初始化
Bmob.initialize(BMOB_APPLICATION_ID, BMOB_REST_API_KEY);
export default Bmob;
