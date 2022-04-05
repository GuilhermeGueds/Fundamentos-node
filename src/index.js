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

function getBalance(statement){
    
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === "credit"){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0)
    return balance;
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


app.get("/account", verifyIfExistsAccountCPF,(request, response) => {
    const { customer } = request;
    
    return response.json(customer);
})

app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
    const {customer} = request;
    const {name} = request.body;

    customer.name = name;

    return response.status(201).send();
})


app.delete("/account", verifyIfExistsAccountCPF,(request, response) => {
    const { customer } = request;

    customers.splice(customer,1);

    return response.status(201).send();
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


app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;
    const {customer} = request;

    const balance = getBalance(customer.statement);
    
    if (balance < amount){
        return response.status(400).json({error: "Insufucient balance !"});
    }

    const statementOperation = {
        amount: balance,
        created_at: new Date(),
        type: "Debit"
    }
    customer.statement.push(statementOperation);
    
    return response.status(201).json("Successful withdraw !");
});

app.get("/statement", verifyIfExistsAccountCPF,(request, response) => {
    const { customer } = request;
    
    return response.json(customer.statement);
});

app.get("/statement/date", verifyIfExistsAccountCPF,(request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");
    const statement = customer.statement.filter((statment) => statment.created_at.toDateString() === new Date(dateFormat).toDateString())
    
    return response.json(statement);
})

app.listen(3333);