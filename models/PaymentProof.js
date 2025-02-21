const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const PaymentProof = sequelize.define("PaymentProof", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  packageId: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM("qr", "bank"),
    allowNull: false,
  },
  proofUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
}, {
  tableName: "payment_proofs",
  timestamps: true,
});


module.exports = PaymentProof;
