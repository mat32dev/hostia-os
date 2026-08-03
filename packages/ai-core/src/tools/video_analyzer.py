import httpx
import os


class VideoAnalyzerTool:
    """Tool for analyzing video footage"""

    def __init__(self):
        self.base_url = os.getenv("GUARD_API_URL", "http://guard-api:8002")

    def analyze_video(self, tenant_id: str, video_path: str, camera_id: str = "default") -> dict:
        """Analyze a video file"""
        try:
            with open(video_path, "rb") as f:
                files = {"file": f}
                data = {
                    "tenant_id": tenant_id,
                    "camera_id": camera_id,
                    "date": ""
                }
                with httpx.Client() as client:
                    res = client.post(
                        f"{self.base_url}/v1/videos/upload",
                        files=files,
                        data=data,
                        timeout=30.0
                    )
                    return res.json()
        except Exception as e:
            return {"error": str(e)}

    def get_analysis_status(self, tenant_id: str, job_id: str) -> dict:
        """Get analysis status"""
        try:
            with httpx.Client() as client:
                res = client.get(
                    f"{self.base_url}/v1/videos/{job_id}?tenant_id={tenant_id}",
                    timeout=10.0
                )
                return res.json()
        except Exception as e:
            return {"error": str(e)}
