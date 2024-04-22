require('dotenv').config();

import { join } from "path";

export = {
  client_id: process.env.EFI_CLIENT_ID,
  client_secret: process.env.EFI_CLIENT_SECRET,
  sandbox: true,
  certificate: join(process.cwd(), `certificates/${process.env.EFI_CERTIFICATE}`, ),
  validateMtls: false
}
