from fastapi import FastAPI, Request, Response
from starlette.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Frontend URL (Next.js server)
FRONTEND_URL = "http://localhost:3000"

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_to_frontend(path: str, request: Request):
    """Proxy all /api/* requests to Next.js frontend"""
    try:
        # Build target URL
        target_url = f"{FRONTEND_URL}/api/{path}"
        
        # Get query params
        if request.query_params:
            target_url += f"?{request.query_params}"
        
        # Get request body for POST/PUT/PATCH
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
        
        # Get headers (filter out hop-by-hop headers)
        headers = {}
        for key, value in request.headers.items():
            if key.lower() not in ['host', 'content-length', 'transfer-encoding', 'connection']:
                headers[key] = value
        
        # Make request to frontend
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
            )
        
        # Return response
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type", "application/json")
        )
    except Exception as e:
        print(f"Proxy error: {e}")
        return Response(
            content=f'{{"error": "Proxy error: {str(e)}"}}',
            status_code=500,
            media_type="application/json"
        )

@app.get("/")
async def root():
    return {"message": "Backend proxy is running"}
