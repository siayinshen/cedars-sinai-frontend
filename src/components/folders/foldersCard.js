import React, { Component } from "react";
import PropTypes from "prop-types";

// Redux stuff
import { connect } from "react-redux";
import store from "../../redux/store";
import {
  DELETE_SUBFOLDER,
  PATCH_SUBFOLDER,
  SORT_SUBFOLDER,
} from "../../redux/types";
import {
  deleteFolder,
  patchSubfolder,
} from "../../redux/actions/folderActions";
import { clearError } from "../../redux/actions/uiActions";

// components
import AddFolder from "./AddFolder.js";
import Folder from "./Folder.js";
import MoveFolderModal from "./moveFolderModal.js";
import DeleteFolderModal from "./deleteFolderModal.js";
import RenameFolderModal from "./renameFolderModal.js";

// css
import "../../css/page.css";

// Ant Design
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Layout,
  Menu,
  notification,
  Spin,
} from "antd";
const { Content } = Layout;

class FoldersCard extends Component {
  constructor() {
    super();
    this.state = {
      // modals
      showMoveFolderModal: false,
      showDeleteFolderModal: false,
      showRenameFolderModal: false,
      // selecting folders
      selectedFolders: [],
      // sorting folders
      requestedSubfolderSortKey: null,
      // dragging folders
      // folderMoveCandidate: { start: [0, 0], target: null, id: "" },
      // folderPosList: [[], []],
      // positionModified: false,
    };
  }

  componentDidUpdate(prevProps) {
    // render action progress and errors
    let currentErrors = this.props.ui.errors;
    let currentloadingActions = this.props.ui.loadingActions;
    let previousLoadingActions = prevProps.ui.loadingActions;
    let previousLoadingActionNames = Object.keys(previousLoadingActions);

    previousLoadingActionNames.forEach((actionName) => {
      if (
        !currentloadingActions[actionName] &&
        previousLoadingActions[actionName]
      ) {
        // if preivousLoadingAction is no longer loading
        switch (actionName) {
          // departments
          case PATCH_SUBFOLDER:
            notification.close(PATCH_SUBFOLDER);
            currentErrors[actionName]
              ? notification["error"]({
                  message: "Failed to update folder",
                  description: currentErrors[actionName],
                  duration: 0,
                  onClose: () => {
                    clearError(PATCH_SUBFOLDER);
                  },
                })
              : notification["success"]({
                  message: "Folder updated!",
                });
            break;
          case DELETE_SUBFOLDER:
            notification.close(DELETE_SUBFOLDER);
            currentErrors[actionName]
              ? notification["error"]({
                  message: "Failed to delete folder",
                  description: currentErrors[actionName],
                  duration: 0,
                  onClose: () => {
                    clearError(DELETE_SUBFOLDER);
                  },
                })
              : notification["success"]({
                  message: "Folder deleted!",
                });
            break;
          default:
            break;
        }
      }
    });
  }

  // modal functions
  toggleShowModal = (modalStateName) => {
    console.log(modalStateName);
    this.setState({
      ...this.state,
      [modalStateName]: !this.state[modalStateName],
    });
  };

  // folder editing action functions
  renameFolder = (formValues) => {
    notification.open({
      key: PATCH_SUBFOLDER,
      duration: 0,
      message: "Renaming folder...",
      icon: <LoadingOutlined />,
    });
    var folder = this.state.selectedFolders[0];
    this.props.patchSubfolder(folder.id, {
      parent: folder.parent,
      title: formValues.folderTitle,
      content: folder.content,
    });
    this.setState({
      ...this.state,
      showRenameFolderModal: false,
      selectedFolders: [],
    });
  };

  moveFolders = () => {
    notification.open({
      key: PATCH_SUBFOLDER,
      duration: 0,
      message: "Moving folder...",
      icon: <LoadingOutlined />,
    });
    let folders = this.state.selectedFolders;
    if (folders.length >= 0) {
      folders.map((x) => {
        if (
          this.props.folders.moveFolderModalCurrentPath.movingFolderId !== x.id
        ) {
          // this.toggleSelect(null, x);
          this.props.patchSubfolder(x.id, {
            parent: this.props.folders.moveFolderModalCurrentPath
              .movingFolderId,
          });
          store.dispatch({ type: DELETE_SUBFOLDER, payload: x.id });
        }
        return 0;
      });
    }
    this.setState({
      showMoveFolderModal: false,
      selectedFolders: [],
    });
  };

  deleteFolders = () => {
    notification.open({
      key: DELETE_SUBFOLDER,
      duration: 0,
      message: "Deleting folder...",
      icon: <LoadingOutlined />,
    });
    this.state.selectedFolders.map((folder) =>
      this.props.deleteFolder(folder.id)
    );
    this.setState({
      showDeleteFolderModal: false,
      selectedFolders: [],
    });
  };

  // mode toggle functions
  exitFolderEditMode = () => {
    // if (this.state.positionModified) {
    //   this.props.syncAllSubFolders(this.props.folders.subfolders);
    //   this.setState({ positionModified: false });
    // }
    this.props.toggleEditingFolders();
  };

  // sort functions
  sortSubfolders = (event) => {
    const sortKey = event.key;
    if (this.props.isEditingFolders) {
      let updatedFolder = this.props.folders;
      updatedFolder.defaultSubfolderSort = sortKey;
      this.props.patchFolder(updatedFolder.id, updatedFolder);
    }
    this.setState({ requestedSubfolderSortKey: sortKey });
    store.dispatch({ type: SORT_SUBFOLDER, payload: sortKey });
  };

  // select folder functions
  toggleSelect = (event, folder) => {
    var folders = this.state.selectedFolders;
    var pos = folders.findIndex((f) => f.id === folder.id);
    if (pos >= 0) {
      folders = folders.slice(0, pos).concat(folders.slice(pos + 1));
    } else {
      folders.push(folder);
    }
    this.setState({ selectedFolders: folders });
  };

  subfolderIsSelected = (subfolder) => {
    let i;
    let selectedFolders = this.state.selectedFolders;
    for (i = 0; i < selectedFolders.length; i++) {
      if (selectedFolders[i].id === subfolder.id) {
        return true;
      }
    }
    return false;
  };

  // drag folder functions
  // folderDragStart = (e, x) => {
  //   var f = document.querySelectorAll(".folder");
  //   var arr = this.state.folderPosList;
  //   f.forEach((a) => {
  //     arr[0].push(a.offsetLeft);
  //     arr[1].push(a.offsetTop);
  //   });
  //   arr = [
  //     arr[0].filter((v, i, a) => a.indexOf(v) === i),
  //     arr[1].filter((v, i, a) => a.indexOf(v) === i),
  //   ];
  //   arr[0][arr[0].length - 1] = +Infinity;
  //   arr[1][arr[1].length - 1] = +Infinity;
  //   this.setState({
  //     positionModified: true,
  //     folderMoveCandidate: {
  //       start: [e.clientX, e.clientY],
  //       target: e.currentTarget,
  //       id: x.id,
  //     },
  //     folderPosList: arr,
  //   });
  // };

  // folderDragEnd = (e) => {
  //   var f = this.state.folderMoveCandidate;
  //   var targetSize = [e.target.clientWidth, e.target.clientHeight];
  //   var arr = this.state.folderPosList;
  //   var final = [
  //     f.target.offsetLeft + e.clientX - f.start[0] - targetSize[0] / 2,
  //     f.target.offsetTop + e.clientY - f.start[1] - targetSize[1] / 2,
  //   ];
  //   var pos = [
  //     Math.max(arr[0].findIndex((x) => x > final[0])),
  //     Math.max(arr[1].findIndex((x) => x > final[1])),
  //   ];
  //   pos = pos[0] + pos[1] * arr[0].length - 1;
  //   store.dispatch({
  //     type: MOVE_SUBFOLDER,
  //     payload: { id: f.id, newIndex: pos },
  //   });
  //   this.props.patchFolder(this.props.pagename, {
  //     defaultSubfolderSort: -1,
  //   });
  //   this.setState({
  //     folderMoveCandidate: { start: [0, 0], target: null, id: "" },
  //     folderPosList: [[], []],
  //   });
  // };

  render() {
    const { isAdmin } = this.props.user;
    const { loadingActions } = this.props.ui;
    const { folder } = this.props.folders;

    // subfolder sort stuff
    const subfolderSortOptions = {
      alphabetical: "Alphabetical order",
      most_popular: "Most popular",
      last_modified: "Last modified",
      most_recently_added: "Most recently added",
      least_recently_added: "Least recently added",
    };

    const subfolderSortMenu = (
      <Menu onClick={this.sortSubfolders}>
        {Object.keys(subfolderSortOptions).map((option) => (
          <Menu.Item key={option}>{subfolderSortOptions[option]}</Menu.Item>
        ))}
      </Menu>
    );

    let s = "s";
    if (this.state.selectedFolders.length === 1) {
      s = "";
    }

    return (
      <div>
        <MoveFolderModal
          visible={this.state.showMoveFolderModal}
          // visible={true}
          moveFolders={this.moveFolders}
          selectedFolders={this.state.selectedFolders}
          toggleShowModal={this.toggleShowModal}
        />
        <RenameFolderModal
          visible={this.state.showRenameFolderModal}
          renameFolder={this.renameFolder}
          selectedFolders={this.state.selectedFolders}
          toggleShowModal={this.toggleShowModal}
        />
        <DeleteFolderModal
          visible={this.state.showDeleteFolderModal}
          deleteFolders={this.deleteFolders}
          selectedFolders={this.state.selectedFolders}
          toggleShowModal={this.toggleShowModal}
        />
        <Content className="content-card">
          <div className="content-card-header">
            <div className="header-row">
              <h1>Folders</h1>
              <span className="page-header-interactive-items">
                {isAdmin &&
                  !this.props.isEditingPost &&
                  this.props.isEditingFolders &&
                  this.state.selectedFolders.length > 0 && (
                    <span>
                      <Button
                        disabled={this.state.selectedFolders.length === 0}
                        type="danger"
                        onClick={() =>
                          this.toggleShowModal("showDeleteFolderModal")
                        }
                      >
                        Delete {this.state.selectedFolders.length} folder{s}
                      </Button>
                      <Button
                        disabled={this.state.selectedFolders.length === 0}
                        onClick={() =>
                          this.toggleShowModal("showMoveFolderModal")
                        }
                      >
                        Move {this.state.selectedFolders.length} folder{s}
                      </Button>
                      <Button
                        disabled={this.state.selectedFolders.length !== 1}
                        onClick={() =>
                          this.toggleShowModal("showRenameFolderModal")
                        }
                      >
                        Rename folder
                      </Button>
                    </span>
                  )}
                <Dropdown overlay={subfolderSortMenu}>
                  <Button>
                    {this.state.requestedSubfolderSortKey === null
                      ? "Sort folders by"
                      : subfolderSortOptions[
                          this.state.requestedSubfolderSortKey
                        ]}
                    <DownOutlined />
                  </Button>
                </Dropdown>
                {isAdmin &&
                  (this.props.isEditingFolders ? (
                    <Button
                      type="primary"
                      style={{
                        background: "#52C41A",
                        borderColor: "#52C41A",
                      }}
                      onClick={this.exitFolderEditMode}
                    >
                      Finish Editing
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      disabled={this.props.isEditingPost}
                      onClick={this.props.toggleEditingFolders}
                    >
                      Edit Folders
                    </Button>
                  ))}
              </span>
            </div>
          </div>
          {loadingActions.SET_FOLDER && (
            <div className="padded-content vertical-content">
              <Spin />
            </div>
          )}
          {!loadingActions.SET_FOLDER &&
            (folder.subfolders.length > 0 ? (
              <div className="padded-content wrapped-content">
                {isAdmin && this.props.isEditingFolders && (
                  // <AddFolder target={folder.id} format={0} />
                  <AddFolder parentFolderId={folder.id} format={0} />
                )}
                {folder.subfolders.map((subfolder, i) => (
                  <Folder
                    // onMouseDown={(e) => this.folderDragStart(e, x)}
                    // onMouseUp={this.folderDragEnd}
                    isSelected={
                      this.props.isEditingFolders &&
                      this.subfolderIsSelected(subfolder)
                    }
                    key={subfolder.id}
                    label={subfolder.title}
                    href={
                      isAdmin && this.props.isEditingFolders
                        ? (e) => this.toggleSelect(e, subfolder)
                        : this.props.isEditingPost
                        ? () => 0
                        : subfolder.id
                    }
                  />
                ))}
              </div>
            ) : (
              <div
                className="padded-content vertical-content"
                style={{ margin: "48px auto" }}
              >
                {isAdmin ? (
                  <div className="vertical-content">
                    <h3 className="em2">
                      It seems like there are no subfolders
                    </h3>
                    <h4 className="em3">
                      You can create subfolders under any folder.
                    </h4>
                    <AddFolder parentFolderId={folder.id} format={1} />
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span>No folders yet</span>}
                  />
                )}
              </div>
            ))}
        </Content>
      </div>
    );
  }
}

FoldersCard.propTypes = {
  user: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  deleteFolder: PropTypes.func.isRequired,
  patchSubfolder: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    folders: state.folders,
    ui: state.ui,
  };
};

export default connect(mapStateToProps, {
  deleteFolder,
  patchSubfolder,
  clearError,
  // syncAllSubFolders,
})(FoldersCard);
