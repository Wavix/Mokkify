/* eslint-disable no-console */
import { UserService } from "../services"

import { dbCreate } from "./connect"

enum Command {
  CreateDatabase = "dbcreate",
  UserAdd = "useradd"
}

const userService = new UserService()

const main = async (args: Array<string>) => {
  const command = args[0]

  switch (command) {
    case Command.CreateDatabase:
      await dbCreate()
      break

    case Command.UserAdd:
      try {
        if (args.length < 3) return console.log("useradd <login> <password>")
        const response = await userService.addUser(args[1], args[2])
        if (response instanceof Error) return console.log(response.message)
        console.log(`User (${response.login}) created with id: ${response.id}`)
        return true
      } catch (error) {
        console.log("Error", (error as Error).message)
      }
      break

    default:
      console.log("Unknown command")
  }
}

main(process.argv.slice(2))
