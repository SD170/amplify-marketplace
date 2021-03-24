import React, { useState, useEffect } from "react";
import { Auth, API, graphqlOperation, input } from "aws-amplify";
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { convertPaiseToRupees, formatOrderDate } from "../utils/index";

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders(sortDirection: DESC, limit: 999) {
        items {
          id
          product {
            id
            description
            price
            owner
            createdAt
          }
          shippingAddress {
            city
            country
            address_line1
            address_state
            address_zip
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const ProfilePage = ({ user, userInfo }) => {
  const [orders, setOrders] = useState([]);
  const [emailDialog, setEmailDialog] = useState(false);
  const [verificationForm, setVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState(userInfo && userInfo.attributes.email);
  const [columns, setColumns] = useState([
    { prop: "name", width: "150" },
    { prop: "value", width: "330" },
    {
      prop: "tab",
      width: "150",
      render: (row) => {
        if (row.name === "Email") {
          const emailVerified = userInfo.attributes.email_verified;
          return emailVerified ? (
            <Tag type="success">Verified</Tag>
          ) : (
            <Tag type="danger">Unverified</Tag>
          );
        }
      },
    },
    {
      prop: "operations",
      render: (row) => {
        switch (row.name) {
          case "Email":
            return (
              <Button
                onClick={() => {
                  setEmailDialog(true);
                }}
                type="info"
                size="small"
              >
                Edit
              </Button>
            );
          case "Delete Profile":
            return (
              <Button type="danger" size="small" onClick={handleDeleteProfile}>
                Delete
              </Button>
            );
          default:
            return;
        }
      },
    },
  ]);

  useEffect(() => {
    if (userInfo) {
      getUserData(userInfo.attributes.sub);
    }
  }, []);

  const getUserData = async (userId) => {
    const input = {
      id: userId,
    };
    const result = await API.graphql(graphqlOperation(getUser, input));
    setOrders(result.data.getUser.orders.items);
  };

  const handleUpdateEmail = async () => {
    try {
      const updatedAttributes = {
        email: email,
      };
      const result = await Auth.updateUserAttributes(user, updatedAttributes);

      if (result === "SUCCESS") {
        sendVerificationCode("email");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error updating attribute"}`,
      });
    }
  };

  const sendVerificationCode = async (attr) => {
    await Auth.verifyCurrentUserAttribute(attr);
    setVerificationForm(true);
    Message({
      type: "info",
      customClass: "message",
      message: `Verification code was sent to ${email}`,
    });
  };

  const handleVerifyEmail = async (attr) => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attr,
        verificationCode
      );
      Notification({
        title: "Success",
        message: "Email successfully verified",
        type: `${result.toLocaleLowerCase()}`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error(err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error updating email"}`,
      });
    }
  };
  const handleDeleteProfile = () => {
    MessageBox.confirm(
      "This will permanently delete your account. Continue?",
      "Attention!",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancle",
        type: "warning",
      }
    )
      .then(async () => {
        try {
          await user.deleteUser(()=>window.location.reload());
        } catch (err) {
          console.error(err,'err');
        }
      })
      .catch(() => {
        Message({
          type: "info",
          message: "Delete canceled",
        });
      });
  };

  return (
    userInfo &&
    user && (
      <>
        <Tabs activeName="1" className="profile-tabs">
          <Tabs.Pane
            label={
              <>
                <Icon name="document" className="icon" /> Summary
              </>
            }
            name="1"
          >
            <h2 className="header">Profile Summary</h2>
            <Table
              columns={columns}
              data={[
                {
                  name: "Your Id",
                  value: userInfo.attributes.sub,
                },
                {
                  name: "Username",
                  value: user.username,
                },
                {
                  name: "Email",
                  value: userInfo.attributes.email,
                },
                {
                  name: "Phone Number",
                  value: userInfo.attributes.phone_number,
                },
                {
                  name: "Delete Profile",
                  value: "Sorry to see you go",
                },
              ]}
              showHeader={false}
              rowClassName={(row) =>
                row.name === "Delete Profile" && "delete-profile"
              }
            />
          </Tabs.Pane>
          <Tabs.Pane
            label={
              <>
                <Icon name="message" className="icon" /> Orders
              </>
            }
            name="2"
          >
            <h2 className="header">Order History</h2>
            {orders.map((order) => (
              <div className="mb-1" key={order.id}>
                <Card>
                  <pre>
                    <p>Order Id: {order.id}</p>
                    <p>Product Description: {order.product.description}</p>
                    <p>Price: {convertPaiseToRupees(order.product.price)}</p>
                    <p>Purchased on: {formatOrderDate(order.createdAt)}</p>
                    {order.shippingAddress && (
                      <>
                        Shipping Address
                        <div className="ml-2">
                          <p>{order.shippingAddress.address_line1}</p>
                          <p>{order.shippingAddress.city}</p>
                          <p>{order.shippingAddress.country}</p>
                          <p>{order.shippingAddress.address_zip}</p>
                        </div>
                      </>
                    )}
                  </pre>
                </Card>
              </div>
            ))}
          </Tabs.Pane>
        </Tabs>

        {/* Email Dialog */}
        <Dialog
          size="large"
          customClass="dialog"
          title="Edit Email"
          visible={emailDialog}
          onCancel={() => {
            setEmailDialog(false);
          }}
        >
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Email">
                <Input
                  value={email}
                  onChange={(term) => {
                    setEmail(term);
                  }}
                />
              </Form.Item>
              {verificationForm && (
                <Form.Item label="Enter Verification Code" labelWidth="120">
                  <Input
                    value={verificationCode}
                    onChange={(term) => {
                      setVerificationCode(term);
                    }}
                  />
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              onClick={() => {
                setEmailDialog(false);
              }}
              type="danger"
            >
              Cancle
            </Button>
            {!verificationForm && (
              <Button type="primary" onClick={handleUpdateEmail}>
                Save
              </Button>
            )}
            {verificationForm && (
              <Button
                type="primary"
                onClick={() => {
                  handleVerifyEmail("email");
                }}
              >
                Submit
              </Button>
            )}
          </Dialog.Footer>
        </Dialog>
      </>
    )
  );
};

export default ProfilePage;
