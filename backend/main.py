from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import io
import json
from typing import Dict, Any, List

app = FastAPI()

# 配置 CORS，允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量存储数据（注意：生产环境中应使用数据库或会话存储）
class GlobalState:
    df: pd.DataFrame = None
    model = None
    feature_columns: List[str] = []
    target_column: str = None

state = GlobalState()

class TrainRequest(BaseModel):
    model_type: str

class PredictRequest(BaseModel):
    features: Dict[str, float]

@app.get("/")
def read_root():
    return {"message": "DataMaster Pro API is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        content = await file.read()
        # 读取 CSV
        df = pd.read_csv(io.BytesIO(content))
        
        # 简单的数据清洗：删除含有空值的行
        df = df.dropna()
        
        # 只保留数值型列（为了演示简便，忽略非数值列）
        df = df.select_dtypes(include=[np.number])
        
        if df.shape[1] < 2:
            raise HTTPException(status_code=400, detail="CSV must contain at least 2 numeric columns")

        state.df = df
        
        # 假设最后一列是目标变量 (y)，前面的列是特征 (X)
        state.target_column = df.columns[-1]
        state.feature_columns = df.columns[:-1].tolist()
        
        return {"message": "File uploaded successfully", "rows": len(df), "columns": list(df.columns)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

# --- 修改重点在这里 ---
@app.get("/data")
def get_data_preview(limit: int = Query(1000, description="Limit the number of rows returned")):
    """
    获取数据预览。
    增加了 limit 参数，默认返回 1000 行。
    """
    if state.df is None:
        raise HTTPException(status_code=400, detail="No data loaded")
    
    df = state.df
    
    # 计算每一列的平均值，用于前端填充默认值
    means = df[state.feature_columns].mean().to_dict()
    
    # 转换为前端需要的格式
    # 使用 .head(limit) 而不是 .head(10)
    # limit 由前端传过来，或者默认 1000
    preview_df = df.head(limit)
    
    return {
        "columns": list(df.columns),
        "rows": preview_df.values.tolist(), 
        "total_rows": len(df),
        "means": means
    }
# ---------------------

@app.post("/train")
def train_model(request: TrainRequest):
    if state.df is None:
        raise HTTPException(status_code=400, detail="No data loaded")
    
    X = state.df[state.feature_columns]
    y = state.df[state.target_column]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model_type = request.model_type
    
    if model_type == "Linear Regression":
        model = LinearRegression()
    elif model_type == "Decision Tree":
        model = DecisionTreeRegressor(random_state=42)
    elif model_type == "Random Forest":
        model = RandomForestRegressor(n_estimators=100, random_state=42)
    elif model_type == "SVR":
        model = SVR()
    else:
        raise HTTPException(status_code=400, detail="Unknown model type")
    
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    state.model = model
    
    return {
        "r2": r2_score(y_test, y_pred),
        "rmse": np.sqrt(mean_squared_error(y_test, y_pred)),
        "mae": mean_absolute_error(y_test, y_pred)
    }

@app.post("/predict")
def predict(request: Dict[str, float]):
    if state.model is None:
        raise HTTPException(status_code=400, detail="Model not trained")
    
    try:
        # 将输入字典转换为 DataFrame，并确保列顺序与训练时一致
        input_data = pd.DataFrame([request], columns=state.feature_columns)
        
        # 如果有缺失的特征，用 0 填充
        input_data = input_data.fillna(0)
        
        prediction = state.model.predict(input_data)[0]
        return {"prediction": float(prediction)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/generate-report", response_class=HTMLResponse)
def generate_report(
    prediction: str = Query("0"), 
    model_type: str = Query("Unknown"), 
    features: str = Query("{}")
):
    import json
    try:
        features_dict = json.loads(features)
    except:
        features_dict = {}

    features_html = "".join([
        f"<div class='feature-item'><span class='label'>{k}</span><span class='value'>{v}</span></div>" 
        for k, v in features_dict.items()
    ])

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>DataMaster Pro Analysis Report</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
            body {{
                font-family: 'Syne', sans-serif;
                background-color: #f0f7ff;
                background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
                background-size: 24px 24px;
                padding: 40px;
                color: #0f172a;
            }}
            .container {{
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border: 2px solid black;
                box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
                padding: 40px;
            }}
            h1 {{
                font-weight: 800;
                font-size: 48px;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: -2px;
            }}
            .header {{
                border-bottom: 2px dashed #ccc;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }}
            .result-box {{
                background-color: #3b82f6;
                color: white;
                padding: 30px;
                border: 2px solid black;
                text-align: center;
                margin-bottom: 40px;
                box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
            }}
            .result-value {{
                font-size: 72px;
                font-weight: 800;
                text-shadow: 4px 4px 0px #000;
                font-family: 'Syne', sans-serif;
            }}
            .section-title {{
                font-size: 14px;
                font-weight: 800;
                text-transform: uppercase;
                border-left: 5px solid #000;
                padding-left: 10px;
                margin-bottom: 20px;
                margin-top: 40px;
            }}
            .features-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
            }}
            .feature-item {{
                background: #f8fafc;
                border: 2px solid black;
                padding: 15px;
            }}
            .label {{
                display: block;
                font-size: 10px;
                text-transform: uppercase;
                font-weight: bold;
                color: #64748b;
                margin-bottom: 5px;
            }}
            .value {{
                font-family: 'JetBrains Mono', monospace;
                font-weight: bold;
                font-size: 18px;
            }}
            .footer {{
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                font-family: 'JetBrains Mono', monospace;
                color: #94a3b8;
            }}
            .tag {{
                display: inline-block;
                background: black;
                color: white;
                padding: 5px 10px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="tag">CONFIDENTIAL REPORT</span>
                <h1>Prediction Analysis</h1>
                <p>Generated by DataMaster Pro v2.0</p>
            </div>

            <div class="result-box">
                <div style="font-family: 'JetBrains Mono'; margin-bottom: 10px; opacity: 0.8;">PREDICTED VALUE</div>
                <div class="result-value">{prediction}</div>
            </div>

            <div class="section-title">Model Configuration</div>
            <div class="features-grid">
                <div class="feature-item">
                    <span class="label">Algorithm</span>
                    <span class="value">{model_type}</span>
                </div>
                <div class="feature-item">
                    <span class="label">Date</span>
                    <span class="value">{pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}</span>
                </div>
            </div>

            <div class="section-title">Input Variables</div>
            <div class="features-grid">
                {features_html}
            </div>

            <div class="footer">
                DATAMASTER PRO SYSTEM REPORT • END OF FILE
            </div>
        </div>
        <script>
            window.print();
        </script>
    </body>
    </html>
    """
    return HTMLContent(html_content)

def HTMLContent(content: str):
    return HTMLResponse(content=content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)