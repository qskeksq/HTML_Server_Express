// 1. 모듈 추출 -- 파일, 템플릿, 데이터베이스, express, bodyParser 모듈
var fs = require('fs');
var ejs = require('ejs');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');

// 2. db 연결
var client = mysql.createConnection({
    user : 'root',
    password : 'mysql',
    database : 'company'
})

// 3.서버 생성
var app = express();

// 4. 미들웨어 설정
app.use(bodyParser.urlencoded({extended:false}));

// 5. 라우터 설정(페이지 설정)
// 첫 화면 - 리스트 보여주기
app.get('/', (request, response)=>{
    // readFile 한 내용이 data 로 전달된다.
    fs.readFile('list.html','utf8', (error, data)=>{
        // 데이터베이스 쿼리한 내용이 results 로 전달
        client.query('SELECT * FROM products', (error, results)=>{
            response.send(ejs.render(data, {data : results}));
        });
    });
 });

 // 추가
app.get('/insert', (request, response)=>{
    fs.readFile('insert.html', 'utf8' ,(error, data)=>{
        response.send(data);
    });
 });

// post 로 넘어오면 데이터를 저장하고 첫 화면으로 넘어간다
app.post('/insert', (request, response)=>{
    var body = request.body;

    console.log(body.name+':'+body.modelnumber+':'+body.series);
    console.log(typeof body.name +':'+typeof body.modelnumber+':'+typeof body.series)

    // 이거 token 안 되는거임?
    // client.query(
    // 'INSERT INTO products (name, modelnumber, series) VALUES (?,?,?)'
    // , [body.name, body.modelnumbers, body.series]
    // , ()=>{response.redirect('/')}
    // )

    client.query(
    'INSERT INTO products (name, modelnumber, series) VALUES ('+body.name+','+body.modelnumber+','+body.series+');'
    , ()=>{response.redirect('/')}
    )

 })

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

 // 삭제
app.get('/delete/:id', (request, response)=>{
    client.query('DELETE FROM products WHERE id='+request.params.id, ()=>{response.redirect('/')});
 })


// 6. 서버 실행
app.listen(8080, ()=>{console.log('server is running')});


