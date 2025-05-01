import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import EducationSection from "../components/EducationSection";
import ExperienceSection from "../components/ExperienceSection";

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => axiosInstance.get("/auth/me").then((res) => res.data),
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => axiosInstance.get(`/users/username/${username}`).then((res) => res.data),
    enabled: !!username,
  });

  const handleSave = async (updatedData) => {
    try {
      let dataToSend;
      let config = {};

      if (updatedData.profilePic || updatedData.bannerPic) {
        const formData = new FormData();
        if (updatedData.profilePic) formData.append("profilePic", updatedData.profilePic);
        if (updatedData.bannerPic) formData.append("bannerPic", updatedData.bannerPic);
        if (updatedData.about) formData.append("about", updatedData.about);
        if (updatedData.skills) formData.append("skills", JSON.stringify(updatedData.skills));
        if (updatedData.experience) formData.append("experience", JSON.stringify(updatedData.experience));
        if (updatedData.education) formData.append("education", JSON.stringify(updatedData.education));
        if (updatedData.email) formData.append("email", updatedData.email);

        dataToSend = formData;
        config.headers = { "Content-Type": "multipart/form-data" };
      } else {
        dataToSend = {
          ...updatedData,
          email: updatedData.email,
        };
      }

      await axiosInstance.put("/users/profile", dataToSend, config);
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["user", username]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (!user) return <div>User not found</div>;

  const isOwnProfile = authUser?._id === user._id;

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
      <ProfileHeader userData={user} isOwnProfile={isOwnProfile} onSave={handleSave} />

      <AboutSection userData={user} isOwnProfile={isOwnProfile} onSave={handleSave} />

      {/* Email Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Email</h2>
        {isOwnProfile ? (
          <input
            type="email"
            defaultValue={user.email}
            onBlur={(e) => handleSave({ email: e.target.value })}
            placeholder="Enter your email"
            className="w-full p-2 border rounded"
            required
          />
        ) : (
          <a
            href={`mailto:${user.email}`}
            className="text-blue-600 underline hover:text-blue-800"
          >
            {user.email}
          </a>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Skills</h2>
        {isOwnProfile ? (
          <input
            type="text"
            defaultValue={user.skills?.join(", ")}
            onBlur={(e) =>
              handleSave({
                skills: e.target.value.split(",").map((skill) => skill.trim()),
              })
            }
            placeholder="Enter comma-separated skills"
            className="w-full p-2 border rounded"
          />
        ) : user.skills && user.skills.length > 0 ? (
          <ul className="list-disc list-inside">
            {user.skills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No skills added</p>
        )}
      </div>

      <ExperienceSection userData={user} isOwnProfile={isOwnProfile} onSave={handleSave} />
      <EducationSection userData={user} isOwnProfile={isOwnProfile} onSave={handleSave} />
    </div>
  );
};

export default ProfilePage;
