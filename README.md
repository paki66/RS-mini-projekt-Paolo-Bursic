git clone 
cd frontend/my-app
node 24
npm install
npm run build
cd backend
conda env create -f environment.yaml -n checkpoint-1
conda activate RS-mini-projekt-Paolo-Bursic
cd placa/
uvicorn --reload main:placa