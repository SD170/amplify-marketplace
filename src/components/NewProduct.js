import React, { useState } from "react";
// prettier-ignore
import { PhotoPicker } from "aws-amplify-react";
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress,
} from "element-react";

const NewProduct = () => {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isShipped, setIsShipped] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [image, setImage] = useState(null);

  const resetStates = () => {
    setDescription("");
    setPrice("");
    isShipped(false);
    setImagePreviewUrl("");
    setImage(null);
  };

  const handleAddProduct = () => {
    // console.log("product added");
    console.log(description, price, isShipped, image);
    //resetting states
    resetStates();
  };
  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <div>
        <Form className="market-header">
          <Form.Item label="Add Product Description">
            <Input
              type="text"
              icon="information"
              placeholder="Description"
              value={description}
              onChange={(description) => {
                setDescription(description);
              }}
            />
          </Form.Item>
          <Form.Item label="Add Product Price">
            <Input
              type="number"
              icon="plus"
              placeholder="Price ($USD)"
              value={price}
              onChange={(price) => {
                setPrice(price);
              }}
            />
          </Form.Item>
          <Form.Item label="Is the Product Shipped or Emailed to the Customer?">
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
          {imagePreviewUrl && (
            <img
              className="image-preview"
              src={imagePreviewUrl}
              alt="Product Preview"
            />
          )}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={(url) => {
              setImagePreviewUrl(url);
            }}
            onPick={(file) => {
              setImage(file);
            }}
            theme={{
              formContainer: {
                margin: 0,
                padding: "0.8em",
              },
              formSection: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              },
              sectionBody: {
                margin: 0,
                width: "250px",
              },
              sectionHeader: {
                padding: "0.2em",
                color: "var(--darkAmazonOrange)",
              },
              photoPickerButton: {
                display: "none",
              },
            }}
          />
          <Form.Item>
            <Button
              disabled={!description || !price || !image}
              type="primary"
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
