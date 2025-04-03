import * as grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import inquirer from "inquirer";
import chalk from "chalk";
import prettyjson from "prettyjson";

const protoDefination = protoLoader.loadSync("./proto/todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(protoDefination);
const todoPackage = grpcObject.todoPackage as any;
const client = new todoPackage.TodoService("localhost:5000", grpc.credentials.createInsecure());
interface select { select: string }


const option = await inquirer.prompt<select>([
  {
    type: 'list',
    name: 'select',
    message: 'Choose an option:',
    choices: [
      { name: chalk.green('CreateTask'), value: 'CreateTask' },
      { name: chalk.blue('ReadAllTask'), value: 'ReadAllTask' },
      { name: chalk.yellow('DeleteTask'), value: 'DeleteTask' },
      { name: chalk.red(':qgRPCTodo'), value: ':qgRPCTodo' },
    ],
  },
]);

switch (option.select) {
  case "CreateTask":
    const task = await inquirer.prompt<select>([
      {
        type: 'input',
        name: 'select',
        message: 'Enter Your Task:',
        default: chalk.gray(`hmm, dinner at 4am?`)
      },
    ]);

    client.createTodo({ task: task.select }, (err: grpc.ServiceError, response: any) => {
      if (err) {
        console.error("Error:", err.message);
      } else {
        console.log(prettyjson.render(response, { keysColor: "yellow", stringColor: "blue" }));
      }
    });

    break;

  case "ReadAllTask":
    client.readTodo({}, (err: grpc.ServiceError, response: any) => {
      if (err) {
        console.error("Error:", err.message);
      } else {
        console.log(prettyjson.render(response, { keysColor: "yellow", stringColor: "blue" }));
      }
    });

    break;

  case "DeleteTask":
    const id = await inquirer.prompt<{ select: string }>([
      {
        type: 'input',
        name: 'select',
        message: 'Enter Task ID:',
      },
    ]);

    client.deleteTodo({ id: Number(id.select) }, (err: grpc.ServiceError, response: any) => {
      if (err) {
        console.error("Error:", err.message);
      } else {
        console.log(prettyjson.render(response, { keysColor: "yellow", stringColor: "blue" }));
      }
    });
    break;

  case ":qgRPCTodo":
    console.log(chalk.magenta(`Thanks for using gRPC todo!`));
    process.exit(1)
}
