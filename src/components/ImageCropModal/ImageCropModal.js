import React, { useRef, useState } from 'react'
import useOnClickOutside from '../../hooks/useOnClickOutside';
import {generateDownload} from '../../utils/CropImage';
import Cropper from 'react-easy-crop';
import "./ImageCropModal.css";
import { getDownloadURL } from 'firebase/storage';

const ImageCropModal = ({setCropModal, setImage, preImage, ratio}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedArea, setCroppedArea] = useState(null);
    const ref = useRef();

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        console.log(croppedArea, croppedAreaPixels)
        setCroppedArea(croppedAreaPixels);
    }

    const onDownload = () => {
		generateDownload(preImage, croppedArea, setImage);
	};

    useOnClickOutside(ref, () => { 
        setCropModal(false);
    })
    
    
    return (
        <div className='presentation' role="presentation">
            <div className='wrapper-modal'>
                <div className='modal' ref={ref}>
                    <span
                    onClick={() => setCropModal(false)}
                    className="modal-close"
                    >
                    X
                    </span>
                    <div className='modal__content'>
                        <div className="crop-container">
                            <Cropper
                            image={preImage}
                            crop={crop}
                            zoom={zoom}
                            aspect={ratio}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            className="crop-croper"
                            />
                        </div>
                        <div className="controls">
                            <input
                            type="range"
                            value={zoom}
                            min={0.5}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => {
                                setZoom(e.target.value)
                            }}
                            className="zoom-range"
                            />
                            <button onClick={() => {onDownload(); setCropModal(false);}}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ImageCropModal
