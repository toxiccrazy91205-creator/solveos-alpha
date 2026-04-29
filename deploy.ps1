# SolveOS Deployment Script
# Usage: .\deploy.ps1

# --- Configuration ---
$EC2_USER = "ubuntu"
$EC2_IP = "REPLACE_WITH_YOUR_EC2_IP"
$KEY_PATH = "C:\path\to\your-key.pem"
$IMAGE_NAME = "solveos-app"
$TAR_NAME = "solveos-app.tar"
$OPENROUTER_API_KEY = "REPLACE_WITH_YOUR_OPENROUTER_KEY"

# 1. Build the Docker image locally
Write-Host "--- Building Docker Image Locally ---" -ForegroundColor Cyan
docker build -t $IMAGE_NAME .

# 2. Save the image to a tarball
Write-Host "--- Saving Image to Tarball ---" -ForegroundColor Cyan
docker save $IMAGE_NAME -o $TAR_NAME

# 3. Upload the tarball to EC2
Write-Host "--- Uploading to AWS EC2 ---" -ForegroundColor Cyan
if (Test-Path $KEY_PATH) {
    scp -i $KEY_PATH $TAR_NAME ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/
} else {
    Write-Error "SSH Key not found at $KEY_PATH"
    exit
}

# 4. Load and Run the image on EC2
Write-Host "--- Deploying on EC2 ---" -ForegroundColor Cyan
ssh -i $KEY_PATH ${EC2_USER}@${EC2_IP} "
    sudo docker load -i /home/${EC2_USER}/$TAR_NAME &&
    sudo docker stop $IMAGE_NAME 2>/dev/null || true &&
    sudo docker rm $IMAGE_NAME 2>/dev/null || true &&
    sudo docker run -d --name $IMAGE_NAME -p 80:3000 --restart always -e OPENROUTER_API_KEY=$OPENROUTER_API_KEY $IMAGE_NAME &&
    rm /home/${EC2_USER}/$TAR_NAME
"

Write-Host "--- Deployment Complete! ---" -ForegroundColor Green
Write-Host "Application should be live at http://$EC2_IP"
