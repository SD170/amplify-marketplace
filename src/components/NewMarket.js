import React, { useState, useContext, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
// prettier-ignore
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react'
import { UserContext } from "../App";

const NewMarket = ({
  handleSearchTerm,
  handleSearchTermChange,
  searchTerm,
  handleClearSearchTerm,
  isSearching,
}) => {
  const { user } = useContext(UserContext);
  const [addMarketDialog, setAddMarketDialog] = useState(false);
  const [marketName, setMarketName] = useState("");
  const [tags, setTags] = useState([
    "Arts",
    "Entertainment",
    "Technology",
    "Education",
    "Crafts",
  ]);
  const [selectedTags, setSelectedTags] = useState([]);
  //after removeing filterable, remote and remoteMethod adding
  // const [options, setOptions] = useState([]);
  const [options, setOptions] = useState([
    { value: "Arts", lable: "Arts" },
    { value: "Entertainment", lable: "Entertainment" },
    { value: "Technology", lable: "Technology" },
    { value: "Education", lable: "Education" },
    { value: "Crafts", lable: "Crafts" },
  ]);

  const handleAddMarket = async (user) => {
    try {
      setAddMarketDialog(false); //after adding dialog disappears
      const input = {
        name: marketName,
        tags: selectedTags,
        owner: user.username,
      };
      const result = await API.graphql(
        graphqlOperation(createMarket, { input: input })
      );
      console.log(result);
      console.info(`Created market: id ${result.data.createMarket.id}`);
      setMarketName("");
      setSelectedTags([]);
      console.log(selectedTags);
    } catch (err) {
      console.error("Error adding new market", err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error Creating Market"}`,
      });
      // console.log(user.username);
    }
  };

  // const handleFilterTags = (query) => {
  //   const options = tags
  //     .map((tag) => {
  //       return { value: tag, lable: tag };
  //     })
  //     .filter((tag) => {
  //       return tag.lable.toLowerCase().includes(query.toLowerCase());
  //     });
  //   setOptions(options);
  // };

  return (
    <>
      <div className="market-header">
        <h1
          className="market-title"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setAddMarketDialog(true);
          }}
        >
          Create Your MarketPlace
          <Button type="text" icon="edit" className="market-title-button" />
        </h1>

        <Form inline={true} onSubmit={handleSearchTerm}>
          <Form.Item>
            <Input
              placeholder="Search Markets..."
              icon="circle-cross"
              onChange={handleSearchTermChange}
              value={searchTerm}
              onIconClick={handleClearSearchTerm}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="info"
              icon="search"
              onClick={handleSearchTerm}
              loading={isSearching}
            >
              Search
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Dialog
        title="Create New Market"
        visible={addMarketDialog}
        onCancel={() => {
          setAddMarketDialog(false);
        }}
        size="large"
        customClass="dialog"
      >
        <Dialog.Body>
          <Form labelPosition="top" onSubmit={(e) => e.preventDefault()}>
            <Form.Item label="Add Market Name">
              <Input
                placeholder="Market Name"
                trim={true}
                onChange={(typedText) => {
                  setMarketName(typedText);
                }}
                value={marketName}
              />
            </Form.Item>
            <Form.Item label="Add Tags">
              <Select
                multiple={true}
                value=""  //VVI
                placeholder="Market Tags"
                onChange={(selected) => {
                  setSelectedTags(selected);
                  console.log(selected);
                }}

                // filterable={true}
                // no-data-text="Search"
                // no-match-text="Search"
                // noMatchText="Search"
                // noDataText="Search"
                // remoteMethod={handleFilterTags}
                // remote={true}
              >
                {options.map((option) => {
                  return (
                    <Select.Option
                      key={option.value}
                      lable={option.lable}
                      value={option.value}
                    />
                  );
                })}
              </Select>
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            onClick={() => {
              setAddMarketDialog(false);
            }}
          >
            Cancle
          </Button>
          <Button
            type="primary"
            onClick={() => {
              handleAddMarket(user);
            }}
            disabled={!marketName}
          >
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
};

export default NewMarket;
