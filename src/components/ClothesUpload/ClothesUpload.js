import { getStorage, ref, uploadString } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { app } from "../../firebaseApp.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import "./ClothesUpload.css";
import ClothesCategory from "../ClothesCategory/ClothesCategory.js";
import ImageCropModal from "../ImageCropModal/ImageCropModal.js";
import { createPortal } from "react-dom";

export default function StyleUpload() {
  const [image, setImage] = useState(""); // 이미지를 저장하기 위한 state
  const [isSubmit, setIsSubmit] = useState(Boolean); // 파일을 업로드 하는지 상태를 파악하기 위한 state
  const [clothesCategory, setClothesCategory] = useState(""); // 카테고리를 저장하기 위한 state
  const [temperature, setTemperature] = useState(""); // 기온을 저장하기 위한 state
  const navigate = useNavigate(); // 메인 버튼을 누를 시 Router 처리를 위한 navigate
  const auth = getAuth(app); // firebase 인증 객체 가져오기
  const user = auth.currentUser; // 현재 사용자의 정보 가져오기
  const [cropModal, setCropModal] = useState(false); // 이미지 크롭 모달창 활성화 state
  const [preImage, setPreImage] = useState(""); // 크롭 전 이미지

  // 파일을 선택 했을 때 읽어오는 함수
  const FileSelect = (e) => {
    const {
      target: { files },
    } = e;
    const file = files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader?.readAsDataURL(file);
      fileReader.onloadend = (e) => {
        const { result } = e?.currentTarget;
        setPreImage(result);
        setCropModal(true);
      };
    } else {
      setPreImage(preImage);
    }
    e.target.value = "";
  };

  // 메인 버튼 누를 시 메인 페이지로 이동
  const MainBtn = () => {
    navigate("/Main");
  };

  // 선택한 이미지를 삭제하기 위한 함수
  const FileDelete = () => {
    setImage(null);
    setPreImage(null);
  };

  // 입력한 기온 값을 넣기 위한 함수
  const TemperatureInput = (e) => {
    setTemperature(e.target.value);
  };

  // 이미지를 업로드하기 위한 함수
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!temperature) {
      toast.error("온도를 입력하세요.");
      return;
    }
    if (!clothesCategory) {
      toast.error("옷 종류를 선택하세요.");
      return;
    }
    setIsSubmit(true);
    const storage = getStorage();
    const filePath = `root/옷장/${clothesCategory}/${uuidv4()}`; // 이미지가 저장되는 경로
    const fileRef = ref(storage, filePath);

    // 입력한 온도 및 현재 사용자 정보를 메타데이터로 보내기 위한 선언
    const metadata = {
      customMetadata: {
        temperature: temperature, // 입력한 온도 값
        userID: user.uid, // 유저의 uid
        user: user.email, // 유저의 이메일
      },
    };

    try {
      const response = await uploadString(fileRef, image, `data_url`, metadata);
      console.log(response);
      setImage(null); // 업로드 후 선택한 파일 제거
      setClothesCategory(""); // 업로드 후 선택한 카테고리 제거
      setTemperature(""); // 업로드 후 기온 제거
      toast.success("업로드 완료!");
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <>
  <p class="description">Upload your Closet items!</p>
      <div className="image-clothes">
        <div className="custom-btn-wrapper">
          <button className="custom-btn btn-10" type="button" onClick={MainBtn}>
            ←
          </button>
        </div>
        <div className="image-area-clothes">
          <label htmlFor="file-input" className="image-area__file-clothes">
            <FiImage size="50" className="file-icon" />
          </label>
          <input
            type="file"
            name="file-input"
            id="file-input"
            className="image-select"
            accept="image/*"
            onChange={FileSelect}
          />
          <input
            type="text"
            value={temperature}
            onChange={TemperatureInput}
            placeholder="기온을 입력 해주세요."
            className="temperature-input"
          />

          <ClothesCategory
            clothesCategory={clothesCategory}
            setClothesCategory={setClothesCategory}
          />

          {image && (
            <div className="image-attachment-clothes">
              <img src={image} alt="attachment" />
              <input
                type="submit"
                value="Upload"
                className="image-submit-btn-clothes"
                onClick={onSubmit}
                disabled={isSubmit}
              />
              <button
                className="image-clear-btn-clothes"
                type="button"
                onClick={FileDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {cropModal &&
        createPortal(
          <ImageCropModal
            setCropModal={setCropModal}
            setImage={setImage}
            preImage={preImage}
            ratio={520/600}
          />,
          document.getElementById("root")
        )}
    </>
  );
}
