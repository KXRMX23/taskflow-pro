import { useState } from "react";
import { uploadProfileImage } from "../services/api";

function Profile() {
const [image, setImage] = useState(null);
const [preview, setPreview] = useState("");

const handleChange = (e) => {
const file = e.target.files[0];

if (!file) return;

setImage(file);
setPreview(URL.createObjectURL(file));
};

const handleUpload = async () => {
if (!image) {
alert("Please select an image.");
return;
}

try {
const formData = new FormData();
formData.append("image", image);

const res = await uploadProfileImage(formData);

alert(res.data.message);
} catch (err) {
console.error(err);
alert("Upload failed.");
}
};

return (
<div style={{ padding: "40px" }}>
<h1>Profile</h1>

{preview && (
<img
src={preview}
alt="Preview"
width="180"
style={{
borderRadius: "50%",
marginBottom: "20px",
}}
/>
)}

<br />

<input type="file" accept="image/*" onChange={handleChange} />

<br />
<br />

<button onClick={handleUpload}>
Upload Profile Picture
</button>
</div>
);
}

export default Profile;
