exports.ycLogin= (req,res,next)=>{
    if(req.cookies.jwt){
if(req.cookies.role == 'ADMIN'){
        next();}
        else {res.send("<meta><h1>Bạn không có quyền truy cập</h1></meta>")};
    }
    else {
        return res.redirect('/');
    }
}

exports.khongycLogin= (req,res,next)=>{
    if(!req.cookies.jwt){
         
        next();
    } else{res.send("<meta><h1>Bạn đã đăng nhập rồi</h1></meta>")};  
}
exports.logout= (req,res,next)=>{
    if(req.cookies.jwt){         
        next();
    }   else{
        res.send("<meta><h1>Bạn chưa đăng nhập </h1></meta>");
    }
}