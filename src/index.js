const express = require ("express");

const {v4: uuidV4} = require("uuid");

const app = express();

app.use(express.json());


function verifyIfExistsAccountCPF(request, response, next){
    const{cpf} = request.headers;
    
    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Customer not found" });
    }
    request.customer = customer;
    return next();
}


const customers = [];


app.post("/account", (request, response) => {
    const {cpf, name} = request.body;

    const customerAlredyExists = customers.some((customer) => customer.cpf === cpf);

    if(customerAlredyExists){
        return response.status(400).json("Cosumer alredy exists !");
    }
    
    customers.push({
        id: uuidV4,
        name,
        cpf,
        statement: []
    })
    return response.status(201).send();
});


app.get("/statement", verifyIfExistsAccountCPF,(request, response) => {
    const { customer } = request;
    
    return response.json(customer.statement);
})

app.put("/", (request, response) => {
    
})

app.patch("/", (request, response) => {
    
})

app.delete("/", (request, response) => {
    
})


app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const {amount, description} = request.body;
    const {customer} = request;
    
    const customerOperation = {
        amount,
        description,
        created_at: new Date(),
        type: "credit"
    }
    
    customer.statement.push(customerOperation)
     
    
    return response.status(201).json("Desposit effected with sucess");
});





app.listen(3333);