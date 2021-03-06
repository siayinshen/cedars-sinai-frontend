import React, { Component } from "react";

// redux
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { searchFolder } from "../redux/actions/folderActions";

// components
import SearchResult from "../components/folders/SearchResult.js";

// images
// import CIcon from "../images/icon.png";

// styles
import "../css/page.css";

// antd
import { SearchOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Layout, Spin } from "antd";
const { Content, Footer } = Layout;

class SearchPage extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: "",
    };
  }

  componentDidMount = () => {
    this.props.searchFolder(this.props.match.params.searchTerm);
  };

  handleChange = (event) => {
    console.log(event.target.value);
    this.setState({
      searchTerm: event.target.value,
    });
  };

  searchFolder = () => {
    const searchTerm = this.state.searchTerm.trim();
    // this.props.searchFolder(searchTerm);
    window.location.href = `${process.env.PUBLIC_URL}/resources/search/${searchTerm}`;
  };

  render() {
    // const { isAdmin } = this.props.user;
    //
    const { folderSearchResults } = this.props.folders;
    const searchTerm = this.props.match.params.searchTerm;
    const { loading } = this.props.ui;

    return (
      <div className="page-container">
        <header className="page-header-container">
          <div className="page-header-main-items">
            <h1>Search Resources</h1>
            <span className="page-header-interactive-items">
              <Input
                className="resources-search no-padding"
                onChange={this.handleChange}
                suffix={<SearchOutlined />}
                placeholder="Search resources by name"
              />
              <Button
                type="primary"
                disabled={
                  this.state.isEditingFolders || this.state.isEditingPost
                }
                onClick={this.searchFolder}
              >
                Search
              </Button>
            </span>
          </div>
        </header>
        <Layout className="vertical-fill-layout">
          <Content className="content-card">
            <div className="content-card-header">
              <div className="header-row">
                {loading && "Searching..."}
                {!loading &&
                  (folderSearchResults.length > 0
                    ? `Search results for "${searchTerm}"`
                    : `Nothing matched ${searchTerm}`)}
              </div>
            </div>
            <div>
              {loading && (
                <div className="padded-content vertical-content">
                  <Spin style={{ marginTop: "48px" }} />
                </div>
              )}
              {!loading &&
                (folderSearchResults.length > 0 ? (
                  folderSearchResults.map((x, i) => (
                    <SearchResult key={i} data={x} />
                  ))
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span>No matches</span>}
                    style={{ margin: "148px 0" }}
                  />
                ))}
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>DevelopForGood ©2020</Footer>
        </Layout>
      </div>
    );
  }
}
SearchPage.propTypes = {
  folders: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  searchFolder: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  editable: state.editable,
  folders: state.folders,
  user: state.user,
  ui: state.ui,
});

export default connect(mapStateToProps, {
  searchFolder,
})(SearchPage);
