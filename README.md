# github-autopull
Github 의 Webhook 기능을 이용하여 명령어를 실행합니다.

## apps.json

### 설정 방법
```javascript
{
    "app1": {
        "url": "/app1",
        "secret": "secret",
        "command": "commands"
    }
}
```

app1: App 이름을 입력해주시면 됩니다.

url: 어느 URL 로 요청이 왔을 때에 커맨드를 작동시킬 지 설정합니다.
작동시킬 url을 입력합니다.

secret: secret key 입니다. 입력하신 Secret Key와 같은 Secret Key 로 요청이 와야 커맨드가 작동됩니다.

command: 작동시킬 커맨드입니다. 커맨드를 여러개 실행시켜야 할 경우 && 를 사용하시면 됩니다.

### 설정 예제
```javascript
{
    "app1": {
        "url": "/app1",
        "secret": "mysecret!",
        "command": "cd /www/ && git pull"
    },
    "app2": {
        "url": "/app2",
        "secret": "MySecret2",
        "command": "cd /app2/ && git pull && pm2 stop app2 && pm2 start app2"
    }
}
```

## config.json

### 설정 방법
```javascript
{
    "http_port": 80
}
```

http_port: HTTP 서버가 돌아갈 포트를 지정합니다.

### 설정 예제
```javascript
{
    "http_port": 8081
}
```

## 라이선스

MIT

## 제작자
미쁨_trusty(trusty_people)
[npmjs](https://www.npmjs.com/~trusty_people)
[github](https://github.com/trustypeople/)