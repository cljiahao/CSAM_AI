import uvicorn

if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8001, reload=True, log_level="info")
