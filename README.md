# fabric1.0
fabric1.0

## prepare

### ssh

sudo dpkg -i openssh-client_6.6p1-2ubuntu1_amd64.deb 

sudo dpkg -i openssh-sftp-server_6.6p1-2ubuntu1_amd64.deb 

sudo dpkg -i libck-connector0_0.4.5-3.1ubuntu2_amd64.deb 

sudo dpkg -i openssh-server_6.6p1-2ubuntu1_amd64.deb 

sudo dpkg -i ssh_6.6p1-2ubuntu1_all.deb 

2.安装后输入以下命令：

ps -e|grep sshd 若看到sshd，就说明ssh-server已经启动了。 

若未启动，尝试以下命令：/etc/init.d/ssh start

### openssl 从私钥导出公钥

openssl ec -in ecprivkey.pem -pubout -out ecpubkey.pem

## 需要fabric docker 镜像

sudo docker pull 

    hyperledger/fabric-ca                 x86_64-1.0.0        a15c59ecda5b        4 weeks ago         238MB

    hyperledger/fabric-ccenv              x86_64-1.0.0        7182c260a5ca        4 weeks ago         1.29GB

    hyperledger/fabric-peer               x86_64-1.0.0        6830dcd7b9b5        4 weeks ago         182MB

    hyperledger/fabric-orderer            x86_64-1.0.0        e317ca5638ba        4 weeks ago         179MB

## 第一步 启动 fabric 1.0 网络
sudo ./fabricNetStart.sh -d

## 第二步 启动 node express http server

### install forever
sudo npm install forever -g

### start node express
PORT=4000 forever start app

forever stop app

## 第三步 初始化 fabric 1.0 channel等
./fabricInit.sh

## 第四步 运行测试数据
./fabricTest.sh 中的数据摘取


## 重新生成cr
- 删除
删除 crypto-config;genesis.block;mychannel.tx

删除 /tmp/fab*

删除 ~/.hfc-key-store

- cryptogen generate --config=./cryptogen.yaml

- configtxgen -profile TwoOrgsOrdererGenesis -outputBlock genesis.block

- export CHANNEL_NAME=mychannel

- configtxgen -profile TwoOrgsChannel -outputCreateChannelTx mychannel.tx -channelID $CHANNEL_NAME

- 修改docker-compose.yaml


