
import httpx
import os

class FastGPTClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url # 示例: https://api.fastgpt.in/api/v1

    async def chat_completion(self, system_prompt: str, user_prompt: str):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "chatId": "risk-audit-session",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "detail": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0
            )
            # FastGPT 通常遵循 OpenAI 响应格式
            return response.json()['choices'][0]['message']['content']

# 建议在环境变量中设置这些值
# FASTGPT_API_KEY = os.getenv("FASTGPT_API_KEY")
# FASTGPT_BASE_URL = os.getenv("FASTGPT_BASE_URL")
