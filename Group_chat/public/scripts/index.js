
document.getElementById('submitSignUp').addEventListener('submit',async(event)=>{
   
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
    } catch (error) {
        console.log('Somthing went wrong');
    }
});

document.getElementById('loginsubmit').addEventListener('submit',async(event)=>{
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
            throw new Error(data.message);
        }
        alert(data.message);
        form.reset();
    } catch (error) {
        console.log(error);
        alert(error);
    }
})