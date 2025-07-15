
window.addEventListener('DOMContentLoaded',()=>{
    const signUpForm=document.getElementById('submitSignUp');
    if(signUpForm){
        signUpForm.addEventListener('submit',signupfunction)
    }

    const loginForm=document.getElementById('loginsubmit');
    if(loginForm){
        loginForm.addEventListener('submit',loginfunction);
    }
})



async function signupfunction(event){
        event.preventDefault();
        const form=event.target;
        const obj={
            name:form.name.value,
            phone:form.phone.value,
            email:form.email.value,
            password:form.password.value
        };
    try {   
        const response=await fetch(`http://localhost:3000/users/signup`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(obj)
        });
        const data=await response.json();
        alert(data.message);
        form.reset();
    } catch (error) {
        console.log('Somthing went wrong');
    }
};

async function loginfunction(event) {
    event.preventDefault();
    const form=event.target;
    const email=form.email.value;
    const password=form.password.value;
    const myObj={
        email:email,
        password:password
    };
    try {
        const response=await fetch('http://localhost:3000/users/login',{
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body:JSON.stringify(myObj)
        });

        const data=await response.json();
        if(!response.ok){
            alert(data.message);
        }
        localStorage.setItem('token',data.token);
        alert(data.message);
        form.reset();
    } catch (error) {
        console.log(error);
        alert(error);
    }
};