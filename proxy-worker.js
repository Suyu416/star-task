// Cloudflare Worker — SiliconFlow API CORS 代理
// 部署到 Cloudflare Workers (免费计划: 10万次/天)
// 部署步骤：
// 1. 注册 https://dash.cloudflare.com/
// 2. 进入 Workers & Pages → 创建 Worker
// 3. 粘贴此文件内容 → 部署
// 4. 获取 Worker URL (如 https://xxx.workers.dev)
// 5. 在星星任务站管理后台填入此 URL 作为 CORS 代理

export default {
  async fetch(request) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // 只代理到 SiliconFlow API
    const targetUrl = 'https://api.siliconflow.cn/v1/chat/completions';

    // 转发请求
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: request.body,
    });

    try {
      const response = await fetch(proxyRequest);
      
      // 返回响应并添加 CORS 头
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          ...corsHeaders,
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: '代理请求失败: ' + e.message }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
