# LyricCanvas 部署指南

## 部署环境
- 服务器：阿里云轻量应用服务器
- 域名：song.daliuai.top
- 操作系统：Ubuntu（推荐）或 CentOS

## 一、服务器环境准备

### 1. 安装 Node.js 和 pnpm

```bash
# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm
```

### 2. 安装 Nginx（用于反向代理）

```bash
# Ubuntu
sudo apt update
sudo apt install nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 二、部署项目

### 1. 上传项目

```bash
# 在本地打包
cd /Users/liuqiang/code/lq/music
pnpm build
pnpm export  # 静态导出（如果可用）

# 或者直接 clone 仓库
```

### 2. 服务器操作

```bash
# 创建目录
mkdir -p /var/www/lyric-canvas
cd /var/www/lyric-canvas

# 拉取代码或上传
git clone <your-repo> .

# 安装依赖
pnpm install
pnpm build
```

---

## 三、配置 Nginx

创建配置文件 `/etc/nginx/sites-available/lyric-canvas`：

```nginx
server {
    listen 80;
    server_name song.daliuai.top;

    # 静态文件（如果是静态导出）
    location / {
        root /var/www/lyric-canvas/out;
        index index.html;
        try_files $uri $uri.html $uri/ /index.html;
    }

    # 或者代理到 Node.js（SSR 模式）
    # location / {
    #     proxy_pass http://127.0.0.1:3000;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host $host;
    #     proxy_cache_bypass $http_upgrade;
    # }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/lyric-canvas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 四、配置 HTTPS（必选）

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（会验证域名）
sudo certbot --nginx -d song.daliuai.top

# 自动续期测试
sudo certbot renew --dry-run
```

---

## 五、PM2 守护进程（推荐 SSR 模式）

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
cd /var/www/lyric-canvas
PORT=3000 pm2 start npm --name "lyric-canvas" -- start

# 开机自启
pm2 startup
pm2 save
```

---

## 六、验证

1. 访问 https://song.daliuai.top
2. 测试搜索歌词、导出图片功能
3. 检查 HTTPS 是否正常

---

## 常见问题

### 1. 网易云音乐 API 无法访问
- 检查服务器能否访问 p1.music.126.net
- 如需代理，配置环境变量

### 2. 图片导出失败
- 服务器需要支持 Canvas（无头浏览器）
- 可能需要安装依赖：sudo apt install -y libgl1-mesa-glx

### 3. 域名解析
- 确保 DNS 已解析到服务器 IP
- 阿里云控制台添加域名记录