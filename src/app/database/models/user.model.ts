import type { UserInstance, UserModel } from "../interfaces/user.interface"
import type Sequelize from "sequelize"

export const User = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes): UserModel => {
  const model: Sequelize.ModelStatic<UserInstance> = sequelize.define<UserInstance>(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      createdAt: "created_at",
      timestamps: false,
      underscored: true
    }
  )

  return model
}
