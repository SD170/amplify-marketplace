import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import { API, graphqlOperation } from "aws-amplify";
import { S3Image } from "aws-amplify-react";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import PayButton from "../components/PayButton";
import { updateProduct, deleteProduct } from "../graphql/mutations";
import { convertRupeesToPaise, convertPaiseToRupees } from "../utils/index";
import { Link } from "react-router-dom";

const Product = ({ product }) => {
  const { userInfo } = useContext(UserContext);
  const isProductOwner = userInfo && userInfo.attributes.sub === product.owner;

  const [updateProductDialog, setUpdateProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isShipped, setIsShipped] = useState(false);

  const isEmailVerified = userInfo && userInfo.attributes.email_verified;

  const handleUpdateProduct = async () => {
    try {
      setUpdateProductDialog(false);
      const input = {
        id: product.id,
        description: description,
        price: convertRupeesToPaise(price),
        shipped: isShipped,
      };
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input: input })
      );
      // console.log({ result });
      Notification({
        title: "Success",
        message: "Product successfully updated!",
        type: "success",
      });
    } catch (err) {
      console.error(`Failed to update product with id: ${product.id}`, err);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setDeleteProductDialog(false);
      const input = {
        id: product.id,
      };
      const result = await API.graphql(
        graphqlOperation(deleteProduct, { input: input })
      );
      // console.log(result);
      Notification({
        title: "Success",
        message: "Product successfully deleted!",
        type: "success",
      });
    } catch (err) {
      console.error(`Failed to delete product with id ${product.id}`, err);
    }
  };

  return (
    <div className="card-container">
      <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
        <S3Image
          imgKey={product.file.key}
          theme={{
            photoImg: { maxWidth: "100%", maxHeight: "100%" },
          }}
        />
        <div className="card-body">
          <h3 className="m-0">{product.description}</h3>
          <div className="items-center">
            {product.shipped ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-mailbox2 icon"
                viewBox="0 0 16 16"
              >
                <path d="M9 8.5h2.793l.853.854A.5.5 0 0 0 13 9.5h1a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H9v1z" />
                <path d="M12 3H4a4 4 0 0 0-4 4v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a4 4 0 0 0-4-4zM8 7a3.99 3.99 0 0 0-1.354-3H12a3 3 0 0 1 3 3v6H8V7zm-3.415.157C4.42 7.087 4.218 7 4 7c-.218 0-.42.086-.585.157C3.164 7.264 3 7.334 3 7a1 1 0 0 1 2 0c0 .334-.164.264-.415.157z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-inbox icon"
                viewBox="0 0 16 16"
              >
                <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z" />
              </svg>
            )}
            {product.shipped ? "Shipped" : "Emailed"}
          </div>
          <div className="text-right">
            <span className="mx-1">₹{convertPaiseToRupees(product.price)}</span>
            {isEmailVerified ? (
              !isProductOwner && (
                <PayButton product={product} userInfo={userInfo} />
              )
            ) : (
              <Link to="/profile" className="link">
                Verify Email
              </Link>
            )}
          </div>
        </div>
      </Card>
      {/* Update / Delete Product Buttons */}
      <div className="text-center">
        {isProductOwner && (
          <>
            <Button
              type="warning"
              icon="edit"
              className="m-1"
              onClick={() => {
                setUpdateProductDialog(true);
                setDescription(product.description);
                setPrice(convertPaiseToRupees(product.price));
                setIsShipped(product.shipped);
              }}
            />
            <Popover
              placement="top"
              width="160"
              trigger="click"
              visible={deleteProductDialog}
              content={
                <>
                  <p>Do you want to delete this?</p>
                  <div className="text-right">
                    <Button
                      size="mini"
                      type="text"
                      className="m-1"
                      onClick={() => {
                        setDeleteProductDialog(false);
                      }}
                    >
                      Cancle
                    </Button>
                    <Button
                      type="primary"
                      size="mini"
                      className="m-1"
                      onClick={() => {
                        handleDeleteProduct();
                      }}
                    >
                      Confirm
                    </Button>
                  </div>
                </>
              }
            >
              <Button
                onClick={() => {
                  setDeleteProductDialog(true);
                }}
                type="danger"
                icon="delete"
              />
            </Popover>
          </>
        )}
      </div>
      {/* Update Product Dialog */}
      <Dialog
        title="Update Product"
        size="large"
        customClass="dialog"
        visible={updateProductDialog}
        onCancel={() => {
          setUpdateProductDialog(false);
        }}
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label="Update Description">
              <Input
                icon="information"
                placeholder="Product Description"
                value={description}
                trim={true}
                onChange={(description) => {
                  setDescription(description);
                }}
              />
            </Form.Item>
            <Form.Item label="Update Price">
              <Input
                type="number"
                icon="plus"
                placeholder="Price (₹INR)"
                value={price}
                onChange={(price) => {
                  setPrice(price);
                }}
              />
            </Form.Item>
            <Form.Item label="Update Shipping">
              <div className="text-center">
                <Radio
                  value="true"
                  checked={isShipped === true}
                  onChange={() => {
                    setIsShipped(true);
                  }}
                >
                  Shipped
                </Radio>
                <Radio
                  value="false"
                  checked={isShipped === false}
                  onChange={() => {
                    setIsShipped(false);
                  }}
                >
                  Emailed
                </Radio>
              </div>
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            onClick={() => {
              setUpdateProductDialog(false);
            }}
          >
            Cancle
          </Button>
          <Button
            type="primary"
            onClick={() => {
              handleUpdateProduct();
            }}
          >
            Update
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
};

export default Product;
