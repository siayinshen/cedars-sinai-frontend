import React, { Component } from "react";

// redux
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getFolder, searchFolder } from "../redux/actions/folderActions";

// components
import FolderPostCard from "../components/folders/folderPostCard";
import FoldersCard from "../components/folders/foldersCard";

// images
// import CIcon from "../images/icon.png";

// styles
import "../css/genPage.css";
import "../css/page.css";

// antd
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Layout } from "antd";
const { Footer } = Layout;

class FolderPage extends Component {
  constructor() {
    super();
    this.state = {
      pagename: "",
      // flags
      isEditingFolders: false,
      isEditingPost: false,
      // showPostCancelConfirm: false,
      showSearchResults: false,
      searchKey: "",
      editor: null,
      // errors
      errors: {},
    };
  }

  componentDidMount() {
    var pageName = this.props.match.params.pageName;
    if (typeof pageName !== "string" || pageName === "") {
      pageName = "home";
    }
    this.props.getFolder(pageName, true);
    this.setState({ ...this.state, pagename: pageName });
    //console.log(this.props)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.ui.errors) {
      return { errors: nextProps.ui.errors };
    } else return null;
  }

  toggleEditingFolders = () => {
    console.log("toggleEditingFolders");
    this.setState({
      isEditingFolders: !this.state.isEditingFolders,
    });
  };
  toggleEditingPost = () => {
    console.log("toggleEditingPost");
    this.setState({
      isEditingPost: !this.state.isEditingPost,
    });
  };

  searchFolderCallback = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.searchFolder();
    } else {
      this.setState({ showSearchResults: false, searchKey: e.target.value });
    }
  };
  searchFolder = () => {
    window.location.href = `${
      process.env.PUBLIC_URL
    }/resources/search/${this.state.searchKey.trim()}`;
  };

  render() {
    const { isAdmin } = this.props.user;

    const { folder } = this.props.folders;
    const { loading } = this.props.ui;
    const pageName = this.props.match.params.pageName;

    // errors
    // const getFolderErrors = this.state.errors.getFolder;

    return (
      <div className="page-container">
        <header className="page-header-container">
          <div className="page-header-secondary-items">
            <span>
              <a className="em4-light" href="/resources">
                Resources
              </a>
              {folder &&
                folder.path &&
                folder.path.map((x, i) => {
                  if (x.name.length >= 30) {
                    x.name = x.name.slice(0, 30) + "...";
                  }
                  return (
                    x.id !== "" &&
                    x.id !== "home" && (
                      <span className="em4-light" key={x.id}>
                        {" / "}
                        <a className="em4-light" href={x.id}>
                          {x.name}
                        </a>
                      </span>
                    )
                  );
                })}
            </span>
          </div>
          <div className="page-header-main-items">
            <h1>
              {loading
                ? "Loading..."
                : typeof folder === "object"
                ? folder.title
                : "Error"}
            </h1>
            <span className="page-header-interactive-items">
              <Input
                onKeyUp={this.searchFolderCallback}
                onSubmit={this.searchFolder}
                disabled={
                  this.state.isEditingFolders || this.state.isEditingPost
                }
                className="resources-search no-padding"
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
          <FoldersCard
            // flags
            isEditingFolders={this.state.isEditingFolders}
            isEditingPost={this.state.isEditingPost}
            // data
            folder={folder}
            pageName={this.pagename}
            // functions
            exitFolderEditMode={this.exitFolderEditMode}
            toggleEditingFolders={this.toggleEditingFolders}
          />
          {(folder.content !== "" || isAdmin) && (
            <FolderPostCard
              // flags
              isEditingFolders={this.state.isEditingFolders}
              isEditingPost={this.state.isEditingPost}
              //data
              folder={folder}
              pagename={pageName}
              //functions
              toggleEditingPost={this.toggleEditingPost}
            />
          )}
          <Footer style={{ textAlign: "center" }}>DevelopForGood ©2020</Footer>
        </Layout>
      </div>
    );
  }
}

FolderPage.propTypes = {
  folders: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  // folder functions
  getFolder: PropTypes.func.isRequired,
  searchFolder: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  editable: state.editable,
  folders: state.folders,
  user: state.user,
  ui: state.ui,
});

export default connect(mapStateToProps, {
  getFolder,
  searchFolder,
})(FolderPage);
