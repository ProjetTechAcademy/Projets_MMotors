from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def message_succes():
    return {"message": "Bravo Mathilde, ta cuisine est opérationnelle !"}
