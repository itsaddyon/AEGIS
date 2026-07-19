# shared/

This folder holds contracts that both `frontend/` and `backend/` agree on.

Right now it contains one reference schema (`types/packet.schema.json`).
The frontend's `frontend/src/types/packet.ts` and the backend's
`backend/app/models/packet.py` are both hand-written to match it.

**Why not a single generated source today?** Keeping it manual for v1
avoids adding a build-time codegen step before the project has a
second consumer of the schema. Once the Learning Hub and IDS modules
land and need their own shared types (lesson objects, alert objects),
it's worth introducing a proper codegen step (e.g. `quicktype` or a
small custom script) that generates both `packet.ts` and `packet.py`
from the JSON Schema files in this folder. Until then, if you change
one, change the other two.
