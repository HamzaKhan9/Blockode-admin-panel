import supabase from "../../supabase.config";

// const insertActivity = async (values: any, file: any) => {
//   if (file !== null) {
//     const { data: key } = await supabase.storage.from("default").upload(
//       //to do "game_image" supabase policy
//       `a8561566-2829-471b-9ccb-9c81ff3f5758/${file?.name}`,
//       file,
//       {
//         cacheControl: "3600",
//         upsert: true,
//       }
//     );

//     if (key) {
//       const { data } = supabase.storage.from("default").getPublicUrl(key.path);
//       if (data) {
//         values.thumbnail_url = data?.publicUrl;
//         values.image_url = data?.publicUrl;
//       }
//     }
//   }

//   const { data } = await supabase.from("activities").insert([values]).select();

//   return data;
// };

// const editActivity = async (values: any, file: any) => {
//   const { categories, ...editValues } = values;

//   if (
//     file === null &&
//     editValues.image_url !== null &&
//     editValues.thumbnail_url !== null
//   ) {
//     const path = editValues?.image_url?.split("default/");
//     const { data } = await supabase.storage
//       .from("default")
//       .remove([`${path[1]}`]);

//     if (data) {
//       editValues.thumbnail_url = null;
//       editValues.image_url = null;
//     }
//   } else if (
//     file !== null &&
//     editValues.image_url === null &&
//     editValues.thumbnail_url === null
//   ) {
//     const { data: key } = await supabase.storage
//       .from("default")
//       .upload(`a8561566-2829-471b-9ccb-9c81ff3f5758/${file?.name}`, file, {
//         cacheControl: "3600",
//         upsert: true,
//       });

//     if (key) {
//       const { data } = supabase.storage.from("default").getPublicUrl(key.path);

//       if (data) {
//         editValues.thumbnail_url = data?.publicUrl;
//         editValues.image_url = data?.publicUrl;
//       }
//     }
//   } else if (
//     file !== null &&
//     editValues.image_url !== null &&
//     editValues.thumbnail_url !== null
//   ) {
//     const path = editValues?.image_url?.split("default/");

//     const { data: key } = await supabase.storage

//       .from("default")
//       .update(`${path[1]}`, file, {
//         cacheControl: "3600",
//         upsert: true,
//       });

//     if (key) {
//       const { data } = supabase.storage.from("default").getPublicUrl(key.path);
//       if (data) {
//         editValues.thumbnail_url = data?.publicUrl;
//         editValues.image_url = data?.publicUrl;
//       }
//     }
//   }

//   await supabase.from("activities").update(editValues).eq("id", editValues?.id);
// };

// const deleteActivity = async (values: any) => {
//   if (
//     (values?.image_url !== undefined || values?.image_url !== null) &&
//     (values?.thumbnail_url !== undefined || values?.thumbnail_url !== null)
//   ) {
//     const path = values?.image_url.split("default/");
//     await supabase.storage.from("default").remove([`${path[1]}`]);
//   }

//   await supabase.from("activities").delete().eq("id", values?.id);
// };

// const getActivities = async () => {
//   let { data: activities } = await supabase.from("activities").select(`
//     *,
//     categories( name )
//   `);
//   return activities;
// };

const uploadFile = async (file: any) => {
  if (file === null) return null;

  const { data: key } = await supabase.storage
    .from("default")
    .upload(`a8561566-2829-471b-9ccb-9c81ff3f5758/${file?.name}`, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (key) {
    const { data } = supabase.storage.from("default").getPublicUrl(key.path);
    return data?.publicUrl || null;
  }

  return null;
};

const deleteFile = async (url: string | null) => {
  if (url === null) return;

  const path = url.split("default/");
  await supabase.storage.from("default").remove([`${path[1]}`]);
};

const insertActivity = async (values: any, file: any) => {
  const imageUrl = await uploadFile(file);
  if (imageUrl) {
    values.thumbnail_url = imageUrl;
    values.image_url = imageUrl;
  }

  const { data } = await supabase.from("activities").insert([values]).select();
  return data;
};

const deleteActivity = async (values: any) => {
  if (values.image_url !== null && values.thumbnail_url !== null) {
    await deleteFile(values.image_url);
  }

  await supabase.from("activities").delete().eq("id", values.id);
};

const getActivities = async () => {
  const { data: activities } = await supabase.from("activities").select(`
    *,
    categories( name )
  `);
  return activities || [];
};

const editActivity = async (values: any, file: any) => {
  const { categories, ...editValues } = values;

  if (
    file === null &&
    editValues.image_url !== null &&
    editValues.thumbnail_url !== null
  ) {
    await deleteFile(editValues.image_url);
    editValues.thumbnail_url = null;
    editValues.image_url = null;
  } else if (
    file !== null &&
    editValues.image_url === null &&
    editValues.thumbnail_url === null
  ) {
    const imageUrl = await uploadFile(file);
    if (imageUrl) {
      editValues.thumbnail_url = imageUrl;
      editValues.image_url = imageUrl;
    }
  } else if (
    file !== null &&
    editValues?.image_url !== null &&
    editValues?.thumbnail_url !== null
  ) {
    const path = editValues?.image_url?.split("default/");

    const { data: key } = await supabase.storage

      .from("default")
      .update(`${path[1]}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (key) {
      const { data } = supabase.storage.from("default").getPublicUrl(key.path);
      if (data) {
        editValues.thumbnail_url = data?.publicUrl;
        editValues.image_url = data?.publicUrl;
      }
    }
  }

  await supabase.from("activities").update(editValues).eq("id", editValues.id);
};
const Activities = {
  insertActivity,
  deleteActivity,
  getActivities,
  editActivity,
};

export default Activities;
