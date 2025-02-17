import React, { useState, useEffect } from "react";
import { message } from "antd";
import {
  UserOutlined,
  DeleteOutlined,
  LoadingOutlined,
  EditOutlined,
  FileImageOutlined,
} from "@ant-design/icons";

import { Avatar } from "antd";

import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  imgWrapper: {
    display: "flex",
    justifyContent: "center",
    paddingBlock: "16px",
    position: "relative",
  },
  profileImg: {
    border: "2px solid #E5E5E5",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "#fff",

    "&:hover": {
      borderColor: "#EDEDED",
    },
  },

  uploadImage: {
    border: "2px solid #E5E5E5",
    width: "180px",
    height: "180px",
    borderRadius: "10%",
    background: "#fff",

    "&:hover": {
      borderColor: "#EDEDED",
    },
  },
  profile: {
    display: "none",
  },
  icon: {
    position: "absolute",
    fontSize: "20px",
    right: "20px",
    top: "12px",
    opacity: "0.6",
    border: "1px solid gray",
    padding: "5px",
    borderRadius: "50%",
    backgroundColor: "white",
    cursor: "pointer",
  },
});

interface ImageUploaderProps {
  src?: any;
  single?: boolean;
  count?: number;
  children?: React.ReactNode;
  listType: "picture-circle" | "picture-card";
  fileList: any;
  setFileList: any;
  onFileUpload: (file: any) => any;
  onFileDeleted?: (file: any) => any;
  loading?: boolean;
  isProfile?: boolean;
  // Add more custom props here as needed
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  src,
  // single,
  count = 1,
  // children,
  fileList,
  setFileList,
  onFileUpload,
  onFileDeleted,
  // loading,
  isProfile = false,
  // ...otherProps
}) => {
  const classes = useStyles();

  const [imageCount, setImageCount] = useState<number>(count);
  const [status, setStatus] = useState<"Uploading" | "Deleting" | undefined>(
    undefined
  );

  useEffect(() => {
    if (src !== "" && src !== undefined && src !== null) {
      isUpdatedSingleImage();
    }
  }, [src]);

  // Function to convert a file URL to a Blob
  async function urlToBlob(url: string): Promise<any> {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], url!.substring(url!.lastIndexOf("/") + 1), {
      type: blob.type,
    });
    return file;
  }

  const isUpdatedSingleImage = () => {
    if (typeof src === "string" && !Array.isArray(fileList)) {
      urlToBlob(src)
        .then((file) => {
          setFileList(file);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else if (Array.isArray(src) && Array.isArray(fileList)) {
      setImageCount(src?.length);
      (src as string[]).forEach((element) => {
        urlToBlob(element)
          .then((file) => {
            setFileList((prevState: any) => [...prevState, file]);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
    } else {
      message.error("Invalid Src");
    }
  };

  const handleChange = async (e: any) => {
    setStatus("Uploading");
    await onFileUpload(e.target.files[0]);
    setStatus(undefined);
  };

  const handleRemove = async (file: any) => {
    setStatus("Deleting");
    await onFileDeleted?.(file);
    setStatus(undefined);
  };

  const UploadButton = () => {
    return (
      <div className={classes.imgWrapper}>
        <label htmlFor="profile">
          <Avatar
            className={isProfile ? classes.profileImg : classes.uploadImage}
            size={isProfile ? 180 : 180}
            icon={
              isProfile ? (
                <UserOutlined style={{ color: "#D0D0D0" }} />
              ) : (
                <FileImageOutlined style={{ color: "#D0D0D0" }} />
              )
            }
          />
        </label>
        <input
          onChange={handleChange}
          type="file"
          id="profile"
          name="profile"
          className={classes.profile}
          style={{ display: "none" }}
        />
        {status === "Uploading" ? (
          <LoadingOutlined className={classes.icon} />
        ) : (
          <EditOutlined
            className={classes.icon}
            onClick={() => document.getElementById("profile")?.click()}
          />
        )}
      </div>
    );
  };

  return (
    <div className="image_uploader">
      <>
        <div style={{ display: "flex", gap: "10px" }}>
          {(Array.isArray(fileList) && fileList?.length < imageCount) ||
          (!Array.isArray(fileList) && fileList === null) ? (
            <UploadButton />
          ) : (
            <React.Fragment>
              {Array.isArray(fileList) ? (
                fileList.length > 0 &&
                fileList.map((file, index) => (
                  <div className={classes.imgWrapper} key={index}>
                    <img
                      src={(file && URL.createObjectURL(file)) || null}
                      className={
                        isProfile ? classes.profileImg : classes.uploadImage
                      }
                      alt="avatar"
                    />
                    {status === "Deleting" ? (
                      <LoadingOutlined className={classes.icon} />
                    ) : (
                      <DeleteOutlined
                        className={classes.icon}
                        onClick={() => {
                          handleRemove(file);
                        }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className={classes.imgWrapper}>
                  <img
                    src={(fileList && URL.createObjectURL(fileList)) || null} // Assuming the URL is stored in the 'url' property
                    className={
                      isProfile ? classes.profileImg : classes.uploadImage
                    }
                    alt="avatar"
                  />
                  {status === "Deleting" ? (
                    <LoadingOutlined className={classes.icon} />
                  ) : (
                    <DeleteOutlined
                      className={classes.icon}
                      onClick={() => {
                        handleRemove(fileList);
                      }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          )}
        </div>
      </>
    </div>
  );
};

export default ImageUploader;
