export async function onRequestPost(context) {
  return Response.json({
    success: true,
    message: "ADMIN API WORKING"
  });
}
