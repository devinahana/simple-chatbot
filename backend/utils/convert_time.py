from pytz import timezone, UTC
from datetime import datetime

def convert_to_local(dt):
    local_tz = timezone("Asia/Jakarta")
    if dt is None:
        return None
    return dt.replace(tzinfo=UTC).astimezone(local_tz).isoformat()