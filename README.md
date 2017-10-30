# HTML Server by Express
- Nodejs Express 모듈을 사용한 HTML 서버

## 클라이언트(HTML)

### 추가

```HTML
<head>
    <meta charset="utf-8" />
    <title>Insert Page</title>
</head>
<body>
    <h1>Insert Page</h1>
    <hr />
    <form method="post">
        <fieldset>
            <legend>INSERT DATA</legend>
            <table>
                <tr>
                    <td><label>Name</label></td>
                    <td><input type="text" name="name" /></td>
                </tr>
                <tr>
                    <td><label>Model Number</label></td>
                    <td><input type="text" name="modelnumber" /></td>
                </tr>
                <tr>
                    <td><label>Series</label></td>
                    <td><input type="text" name="series" /></td>
                </tr>
            </table>
            <input type="submit" />
        </fieldset>
    </form>
</body>
</html>
```

### 목록

```HTML
<head>
    <meta charset="utf-8" />
    <title>List Page</title>
</head>
<body>
    <h1>List Page</h1>
    <a href="/insert">INSERT DATA</a>
    <hr />
    <table width="100%" border="1">
        <tr>
            <th>DELETE</th>
            <th>EDIT</th>
            <th>ID</th>
            <th>Name</th>
            <th>Modle Number</th>
            <th>Series</th>
        </tr>
        <% data.forEach(function(item, index) { %>
        <tr>
            <td><a href="/delete/<%= item.id %>">DELETE</a></td>
            <td><a href="/edit/<%= item.id %>">EDIT</a></td>
            <td><%= item.id %></td>
            <td><%= item.name %></td>
            <td><%= item.modelnumber %></td>
            <td><%= item.series %></td>
        </tr>
        <% }); %>
    </table>

</body>
</html>
```

### 수정

```HTML
<head>
    <meta charset="utf-8" />
    <title>Insert Page</title>
</head>
<body>
    <h1>Edit Page</h1>
    <hr />
    <form method="post">
        <fieldset>
            <legend>EDIT DATA</legend>
            <table>
                <tr>
                    <td><label>ID</label></td>
                    <td><input type="text" name="id" value="<%= data.id %>" disabled /></td>
                </tr>
                <tr>
                    <td><label>Name</label></td>
                    <td><input type="text" name="name" value="<%= data.name %>" /></td>
                </tr>
                <tr>
                    <td><label>Model Number</label></td>
                    <td><input type="text" name="modelnumber" value="<%= data.modelnumber %>"/></td>
                </tr>
                <tr>
                    <td><label>Series</label></td>
                    <td><input type="text" name="series" value="<%= data.series %>"/></td>
                </tr>
            </table>
            <input type="submit" />
        </fieldset>
    </form>
</body>
</html>
```

## 서버

1. 모듈 추출
2. db 연결
3. 서버 생성 & 등록
4. 미들웨어 설정
5. 라우터 설정

###  1. 모듈 추출 -- 파일, 템플릿, 데이터베이스, express, bodyParser 모듈
```javaScript
var fs = require('fs');
var ejs = require('ejs');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
```

### 2. db 연결

```javaScript
var client = mysql.createConnection({
    user : 'root',
    password : 'mysql',
    database : 'company'
});
```

###  3.서버 생성 & 등록

```javaScript
var app = express();

app.listen(8080, ()=>{console.log('server is running')});
```

### 4. 미들웨어 설정

```javaScript
app.use(bodyParser.urlencoded({extended:false}));
```

### 5. 라우터 설정

- express가 기존 방식과 가장 다른 점이 바로 라우터이다. 기존에는 메소드와 url을 직접 분석해야 했지만 express에서는 자동으로 분리해준다

#### 첫 화면 - 리스트 보여주기

```javaScript
app.get('/', (request, response)=>{
    // readFile 한 내용이 data 로 전달된다.
    fs.readFile('list.html','utf8', (error, data)=>{
        // 데이터베이스 쿼리한 내용이 results 로 전달
        client.query('SELECT * FROM products', (error, results)=>{
            response.send(ejs.render(data, {data : results}));
        });
    });
 });
 ```

 #### 입력창

 - GET으로 /insert가 넘어오면 HTML 화면을 넘겨주고
 - POST로 /insert가 넘어오면 데이터를 저장하고 첫 화면으로 넘어간다

```javaScript
app.get('/insert', (request, response)=>{
    fs.readFile('insert.html', 'utf8' ,(error, data)=>{
        response.send(data);
    });
 });

// post 로 넘어오면 데이터를 저장하고 첫 화면으로 넘어간다
app.post('/insert', (request, response)=>{
    var body = request.body;

    console.log(body.name+':'+body.modelnumber+':'+body.series);
    console.log(typeof body.name +':'+typeof body.modelnumber+':'+typeof body.series);

    client.query(
    'INSERT INTO products (name, modelnumber, series) VALUES ('+body.name+','+body.modelnumber+','+body.series+');'
    , ()=>{response.redirect('/')}
    )
 });
```

#### 업데이트

 - GET으로 /insert가 넘어오면 HTML 화면을 넘겨주고
 - POST로 /insert가 넘어오면 데이터를 업데이트하고 첫 화면으로 넘어간다

```javaScript
// 업데이트
app.get('/edit/:id', (request, response)=>{
    fs.readFile('edit.html', 'utf8', (error, data)=>{
        client.query('SELECT * FROM products WHERE id = '+request.params.id
                                                // 여기서 data 는 html 이고 진짜 넣어줄 값이 result 로 들어오는 값이다. 헷갈리지 말자
        , (error, result)=>{ response.send(ejs.render(data, {data : result[0]}));}
    )
    })
 })

app.post('/edit/:id', (request, response)=>{

    var body = request.body;

    client.query(
        'UPDATE products SET name='+body.name+',modelnumber='+body.modelnumber+',series='+body.series+' WHERE id='+request.params.id    
        , ()=>{response.redirect('/')}
    )
 })
 ```

 #### 삭제

 ```javaScript
app.get('/delete/:id', (request, response)=>{
    client.query('DELETE FROM products WHERE id='+request.params.id, ()=>{response.redirect('/')});
 })
```