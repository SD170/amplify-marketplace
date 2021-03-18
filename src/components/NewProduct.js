import React, { useState } from "react";
// prettier-ignore
import { Auth, Storage, API, graphqlOperation } from "aws-amplify";
import { PhotoPicker } from "aws-amplify-react";
import aws_exports from "../aws-exports";
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress,
} from "element-react";
import { createProduct } from "../graphql/mutations";
import { convertDollerToCents } from "../utils/index";

const NewProduct = ({marketId}) => {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isShipped, setIsShipped] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetStates = () => {
    setDescription("");
    setPrice("");
    setIsShipped(false);
    setImagePreviewUrl("");
    setImage(null);
    setIsUploading(false);
  };

  const handleAddProduct = async () => {
    try {
      setIsUploading(true);
      const visibility = "public";
      const { identityId } = await Auth.currentCredentials();
      const fileName = `/${visibility}/${identityId}/${Date.now()}-${image.name}`;
      const uploadedFile = await Storage.put(fileName, image.file, {
        contentType: image.type,
      });

      const file = {
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region,
        key: uploadedFile.key,
      };

      const input = {
        productMarketId:marketId,
        description:description,
        shipped:isShipped,
        price:convertDollerToCents(price),
        file:file
      } 

      const result = await API.graphql(graphqlOperation(createProduct,{input:input}));
      console.log('Created Product', result);
      Notification({
        title: "Success",
        message:"Product successfull created",
        type:"success"
      })
      //resetting states
      resetStates();
    } catch (err) {
      console.error('Error adding product', err);
    }
    
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
              disabled={!description || !price || !image || isUploading}
              type="primary"
              onClick={handleAddProduct}
              loading={isUploading}
            >
              {isUploading?'Uploading...':'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
