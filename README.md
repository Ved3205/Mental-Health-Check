
# Mental Health Score Predictor

> An end-to-end Machine Learning application that predicts a mental health score from student lifestyle, academic, social-media usage, and behavioral factors.

**Live Application:** [Mental Health Score Predictor](https://mental-health-check-1-1wft.onrender.com/)

**Backend API:** [FastAPI Prediction Service](https://mental-health-check-xqkb.onrender.com/)

**Author:** [Vednarayan Hiralkar](https://github.com/Ved3205)

---

## Overview

Mental Health Score Predictor is a complete machine learning application built to demonstrate the full lifecycle of a supervised ML project — from data exploration and preprocessing to model training, evaluation, serialization, API development, frontend integration, and cloud deployment.

The application accepts behavioral and lifestyle information such as:

- Age
- Gender
- Country
- Academic level
- Social-media platform usage
- Purpose of social-media usage
- Daily usage hours
- Daily phone unlocks
- Study hours
- Physical activity
- Sleep duration
- Stress level

The trained machine learning pipeline processes these inputs and returns a predicted mental health score.

> **Disclaimer:** This project is intended for educational and demonstration purposes. It is not a medical diagnostic or psychological assessment tool.

---

## Project Highlights

- End-to-end supervised Machine Learning workflow
- Exploratory Data Analysis using Pandas, NumPy, Matplotlib and Seaborn
- Data cleaning and validation
- Feature engineering
- Categorical and numerical preprocessing
- Scikit-learn `Pipeline`
- Scikit-learn `ColumnTransformer`
- Hyperparameter tuning with `RandomizedSearchCV`
- Model evaluation using regression metrics
- Feature importance analysis
- Model serialization with Joblib
- FastAPI REST API
- Pydantic request validation
- JavaScript frontend
- Frontend-to-backend REST integration
- CORS configuration
- Cloud deployment using Render

---

# Machine Learning Workflow

The project follows a structured ML workflow:

```text
                    Dataset
                       │
                       ▼
                Data Inspection
                       │
                       ▼
                 Data Cleaning
                       │
                       ▼
            Exploratory Data Analysis
                       │
                       ▼
              Feature Engineering
                       │
                       ▼
             Train / Test Split
                       │
                       ▼
          Preprocessing Pipeline
          ┌────────────┴────────────┐
          │                         │
     Numerical                 Categorical
      Features                   Features
          │                         │
     Imputation                 Encoding
          │                         │
       Scaling                     │
          └────────────┬────────────┘
                       ▼
                Model Training
                       │
                       ▼
             Hyperparameter Tuning
                       │
                       ▼
                Model Evaluation
                       │
                       ▼
              Final ML Pipeline
                       │
                       ▼
                 Joblib Model
                       │
                       ▼
                  FastAPI API
                       │
                       ▼
                 Web Frontend
                       │
                       ▼
                  Live System
````

---

# 1. Dataset

The project uses the **Student Social Media and Mental Health Impact** dataset.

The dataset contains information related to student demographics, academic characteristics, social-media behavior, lifestyle habits, stress levels, and mental health scores.

The dataset used in this project is included in the repository:

```text
Student Social Media And Mental Health Impact.csv
```

---

# 2. Data Cleaning

Before model development, the dataset was inspected and cleaned.

The preprocessing workflow included:

* Checking missing values
* Detecting duplicate records
* Identifying invalid values
* Handling inconsistent data
* Checking numerical ranges
* Inspecting categorical values
* Preparing features for machine learning

Python libraries used:

```text
Pandas
NumPy
```

---

# 3. Exploratory Data Analysis

Exploratory Data Analysis was performed to understand the dataset and identify relationships between behavioral factors and the target variable.

The analysis included:

* Distribution analysis
* Correlation analysis
* Numerical feature analysis
* Categorical feature analysis
* Relationship between lifestyle factors and mental health score
* Feature importance analysis

Visualization tools:

```text
Matplotlib
Seaborn
```

The complete analysis and model development process is available in:

```text
project.ipynb
```

---

# 4. Feature Engineering

Feature engineering was performed to make the raw dataset suitable for machine learning.

The project handles both numerical and categorical variables.

### Numerical features

Examples:

```text
Age
Avg_Daily_Usage_Hours
Daily_Unlocks
Study_Hours
Physical_Activity_Hours
Sleep_Hours_Per_Night
```

### Categorical features

Examples:

```text
Gender
Country
Academic_Level
Most_Used_Platform
Purpose_Of_Use
Stress_Level
```

A grouped country feature was also incorporated into the model pipeline to handle country-level variation.

---

# 5. Preprocessing Pipeline

One of the main engineering aspects of the project is the use of a Scikit-learn preprocessing pipeline.

The preprocessing workflow uses:

```python
Pipeline
ColumnTransformer
```

This allows preprocessing and prediction to remain consistent between model training and production inference.

Conceptually:

```text
Raw Input
   │
   ├── Numerical Features
   │       │
   │       ├── Missing Value Handling
   │       └── Feature Scaling
   │
   └── Categorical Features
           │
           ├── Missing Value Handling
           └── Encoding
                  │
                  ▼
             ML Model
                  │
                  ▼
              Prediction
```

This approach also reduces the risk of preprocessing inconsistencies between training and deployment.

---

# 6. Model Development

Multiple machine learning approaches were evaluated during model development.

The project uses a train/test split followed by model comparison and hyperparameter optimization.

The workflow:

```text
Train / Test Split
       │
       ▼
Baseline Models
       │
       ▼
Model Comparison
       │
       ▼
RandomizedSearchCV
       │
       ▼
Best Hyperparameters
       │
       ▼
Final Model
```

Model performance was evaluated using regression metrics such as:

* Mean Absolute Error (MAE)
* Mean Squared Error (MSE)
* Root Mean Squared Error (RMSE)
* R² Score

Feature importance was also examined to understand the contribution of input variables.

---

# 7. Model Serialization

After training and evaluation, the final machine learning pipeline was serialized using Joblib.

The trained model is stored as:

```text
Mental_Health_Model.pkl
```

The FastAPI backend loads this saved pipeline during application startup:

```python
model = joblib.load("Mental_Health_Model.pkl")
```

This allows the deployed API to perform predictions without retraining the model.

---

# 8. FastAPI Backend

The backend is implemented using **FastAPI**.

The API provides a clean interface between the frontend and the trained machine learning model.

### Architecture

```text
Frontend
   │
   │ JSON Request
   ▼
FastAPI
   │
   ▼
Pydantic Validation
   │
   ▼
Input DataFrame
   │
   ▼
Saved ML Pipeline
   │
   ▼
Prediction
   │
   ▼
JSON Response
   │
   ▼
Frontend
```

---

# API Endpoints

## GET `/`

Returns basic information about the application.

Example response:

```json
{
  "message": "Welcome to Vednarayan Hiralkar's AI Application",
  "name": "Vednarayan Hiralkar",
  "github": "https://github.com/Ved3205"
}
```

---

## POST `/predict`

Generates a predicted mental health score from user-provided information.

### Request

```json
{
  "age": 21,
  "gender": "Male",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 80,
  "study_hours": 5,
  "physical_activity_hours": 1.5,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
```

### Response

```json
{
  "predicted_mental_health_score": 6.78
}
```

---

# API Validation

The API uses **Pydantic** to validate incoming data before sending it to the machine learning pipeline.

For example:

```python
age: int = Field(..., ge=10, le=100)

avg_daily_usage_hours: float = Field(..., ge=0, le=24)

sleep_hours_per_night: float = Field(..., ge=0, le=24)
```

Categorical variables are also restricted to valid values using Python's `Literal` type.

This prevents malformed or unexpected inputs from reaching the prediction pipeline.

---

# Frontend

The frontend is built using:

```text
HTML
CSS
JavaScript
```

The frontend provides an interactive form where users can enter their lifestyle and behavioral information.

### Frontend responsibilities

1. Collect user input
2. Validate input
3. Build the prediction payload
4. Send a POST request to the FastAPI backend
5. Handle loading state
6. Receive prediction response
7. Display the predicted score
8. Display an interpretation of the score
9. Handle API errors
10. Allow the user to retry a prediction

The frontend communicates with:

```text
https://mental-health-check-xqkb.onrender.com/predict
```

---

# Deployment Architecture

The application is deployed as two independent services.

```text
                    USER
                      │
                      ▼
          ┌──────────────────────┐
          │      FRONTEND        │
          │       Render         │
          │                      │
          │ HTML / CSS / JS      │
          └──────────┬───────────┘
                     │
                     │ POST /predict
                     ▼
          ┌──────────────────────┐
          │       BACKEND        │
          │       Render         │
          │                      │
          │      FastAPI         │
          │         │            │
          │         ▼            │
          │   Pydantic Validation│
          │         │            │
          │         ▼            │
          │   ML Pipeline        │
          │         │            │
          │         ▼            │
          │   Prediction         │
          └──────────────────────┘
```

### Deployment URLs

| Component | Technology              | Status   |
| --------- | ----------------------- | -------- |
| Frontend  | HTML / CSS / JavaScript | Deployed |
| Backend   | FastAPI                 | Deployed |
| ML Model  | Scikit-learn + Joblib   | Deployed |
| Hosting   | Render                  | Active   |

---

# Technology Stack

## Programming

* Python
* JavaScript

## Data Science

* Pandas
* NumPy
* Matplotlib
* Seaborn

## Machine Learning

* Scikit-learn
* Regression
* Feature Engineering
* Data Preprocessing
* Pipeline
* ColumnTransformer
* RandomizedSearchCV
* Model Evaluation

## Backend

* FastAPI
* Pydantic
* REST API
* CORS

## Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API

## Deployment

* Render

## Tools

* Git
* GitHub
* Joblib
* Jupyter Notebook

---

# Repository Structure

```text
Mental-Health-Check/
│
├── Mental_Health_Model.pkl
│
├── Student Social Media And Mental Health Impact.csv
│
├── project.ipynb
│
├── main.py
│
├── index.html
├── script.js
├── style.css
│
├── requirements.txt
├── runtime.txt
├── .gitignore
│
└── README.md
```

---

# Local Setup

## 1. Clone the repository

```bash
git clone https://github.com/Ved3205/Mental-Health-Check.git
```

```bash
cd Mental-Health-Check
```

---

## 2. Create a virtual environment

### Windows

```bash
python -m venv venv
```

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
```

```bash
source venv/bin/activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Start the FastAPI backend

```bash
uvicorn main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

---

# Interactive API Documentation

FastAPI automatically provides Swagger UI.

After starting the backend, open:

```text
http://127.0.0.1:8000/docs
```

You can test the `/predict` endpoint directly through the interactive API documentation.

---

# Testing the API

Example using Python:

```python
import requests

url = "http://127.0.0.1:8000/predict"

payload = {
    "age": 21,
    "gender": "Male",
    "country": "India",
    "academic_level": "Undergraduate",
    "most_used_platform": "Instagram",
    "purpose_of_use": "Entertainment",
    "avg_daily_usage_hours": 4.5,
    "daily_unlocks": 80,
    "study_hours": 5,
    "physical_activity_hours": 1.5,
    "sleep_hours_per_night": 7,
    "stress_level": "Medium"
}

response = requests.post(url, json=payload)

print(response.json())
```

Expected response format:

```json
{
  "predicted_mental_health_score": 6.78
}
```

---

# What I Learned

This project provided hands-on experience with the complete ML application lifecycle.

### Machine Learning

* Data cleaning
* Exploratory data analysis
* Feature engineering
* Numerical and categorical preprocessing
* Model selection
* Hyperparameter tuning
* Regression evaluation
* Feature importance

### Software Engineering

* Building reusable ML pipelines
* Model serialization
* REST API development
* Request validation
* Frontend/backend integration
* Error handling
* CORS configuration

### Deployment

* Separating frontend and backend services
* Deploying a FastAPI application
* Connecting a deployed frontend to a deployed ML API
* Testing a production prediction workflow

---

# Project Architecture

```text
┌──────────────────────────────────────────────────────┐
│                    USER INTERFACE                    │
│                                                      │
│                  HTML / CSS / JS                     │
└─────────────────────────┬────────────────────────────┘
                          │
                          │ JSON
                          ▼
┌──────────────────────────────────────────────────────┐
│                    FASTAPI SERVER                    │
│                                                      │
│                   POST /predict                      │
└─────────────────────────┬────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                  PYDANTIC VALIDATION                 │
│                                                      │
│          Type + Range + Category Validation          │
└─────────────────────────┬────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│              SAVED ML PIPELINE                       │
│                                                      │
│  Preprocessing → Feature Transformation → Model      │
└─────────────────────────┬────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                     PREDICTION                       │
│                                                      │
│             Mental Health Score                      │
└─────────────────────────┬────────────────────────────┘
                          │
                          ▼
                    JSON RESPONSE
```

---

# Future Improvements

Potential improvements for future versions include:

* Model monitoring and performance tracking
* Automated model retraining
* Experiment tracking
* Improved model interpretability
* SHAP-based explanations
* More extensive validation
* CI/CD automation
* Containerization with Docker
* Automated API testing
* Improved production logging
* Database integration
* Authentication and user history
* Additional model comparison experiments

---

# Disclaimer

This application is an educational machine learning project.

The predicted score is **not a medical diagnosis** and should not be used as a substitute for professional medical, psychological, or mental-health advice.

---

# Author

## Vednarayan Hiralkar

**B.Tech Computer Science & Engineering**
**Honors in Artificial Intelligence**
Government Engineering College, Aurangabad

### Skills demonstrated through this project

`Python` · `Pandas` · `NumPy` · `Scikit-learn` · `Machine Learning` · `FastAPI` · `Pydantic` · `REST APIs` · `JavaScript` · `Joblib` · `Git` · `Render`

### Connect

* [GitHub](https://github.com/Ved3205)
* [LinkedIn](https://linkedin.com/in/vedhiralkar)
* [Email](mailto:vnshiralkar@gmail.com)

---

## Live Project

**[Launch the Mental Health Score Predictor](https://mental-health-check-1-1wft.onrender.com/)**

**[Explore the GitHub Repository](https://github.com/Ved3205/Mental-Health-Check)**
