// ABAC

// const projects = [
//   {
//     id: 1,
//     name: "HR Project",
//     department: "HR",
//     accessLevel: 1,
//     team: [1, 2],
//   },
//   {
//     id: 1,
//     name: "IT Project",
//     department: "IT",
//     accessLevel: 2,
//     team: [3, 4],
//   },
// ];

// const users = [
//   {
//     id: 1,
//     name: "John",
//     department: "HR",
//     accessLevel: 4,
//   },
// ];

// export const canViewProject = ({ user, project }) => {
//   return (
//     user.role === "admin" ||
//     user.department === project.department ||
//     (user.accessLevel === project.accessLevel && project.team.includes(user.id))
//   );
// };
// export const canUpdateProject = ({ user, project }) => {
//   return (
//     user.role === "admin" || (user.role === "manager" && user.department === project.department) || project.team.includes(user.id)
//   );
// };
