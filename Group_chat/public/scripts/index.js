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
})