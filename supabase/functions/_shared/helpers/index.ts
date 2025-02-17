export function getRecordSize(record: Record<string, any>) {
  return new TextEncoder().encode(JSON.stringify(record)).length;
}

export function transformRecordWithinSize(
  record: Record<string, any>,
  size: number
) {
  const initialSize = getRecordSize(record);
  let reduced = false;
  while (getRecordSize(record) > size) {
    record.goals.pop();
    reduced = true;
  }
  if (reduced) {
    console.log(
      `Record size reduced from ${initialSize} to ${getRecordSize(record)}`
    );
  }
  return record;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export const ALGOLIA_DEV_APP_ID = "JRPR6SPIKF";
export const ALGOLIA_DEV_API_KEY = "acd965220fdacc49f3d45b2fc0d99f63";
export const ALGOLIA_PROD_APP_ID = "7O0KFUUVY6";
export const ALGOLIA_PROD_API_KEY = "76d09faa1755a7aff4f488e35d9b9e20";
export const SUPABASE_PROD_URL = "https://kszrzybbmdzfsouztknz.supabase.co";
export const SUPABASE_DEV_URL = "https://mtzwzsxblhulourliqvr.supabase.co";

const supabase_url = Deno.env.get("REACT_APP_SUPABASE_PROJECT_URL") as string;
const isDevEnv = supabase_url === SUPABASE_DEV_URL;

export const invitationEmailTemplate = ({
  account_role,
  account_team_name,
  message,
  token,
}) => {
  return `<div style="background-color: #f2f2f2; margin: 0 auto">
  <table
    align="center"
    width="100%"
    border="0"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="
      max-width: 480px;
      border-radius: 5px;
      margin: 0 auto 40px;
      padding: 20px;
    "
  >
    <tbody>
      <tr style="width: 100%">
        <td>
          <img
            alt="LCA"
            height="64"
            src="https://kszrzybbmdzfsouztknz.supabase.co/storage/v1/object/public/default/assets/lca-logo.webp"
            style="
              display: block;
              outline: none;
              border: none;
              text-decoration: none;
              margin: 64px 0 56px;
            "
            width="64"
            class="CToWUd"
            data-bit="iit"
          />
          <p
            style="
              font-size: 24px;
              line-height: 40px;
              margin: 0 0 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                'Droid Sans', 'Helvetica Neue', sans-serif;
              color: #000000;
              font-weight: 600;
            "
          >
            Join your team on Life Culture Audit
          </p>
          <p
            style="
              font-size: 14px;
              line-height: 24px;
              margin: 0 0 40px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                'Droid Sans', 'Helvetica Neue', sans-serif;
              color: #777;
            "
          >
            You have been invited to join ${account_team_name} as a ${account_role}.
          </p>
          ${
            message
              ? `<p
          style="
            font-size: 24px;
            line-height: 20px;
            margin: 0 0 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
              'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
              'Droid Sans', 'Helvetica Neue', sans-serif;
            color: #000000;
            font-weight: 600;
          "
        >
          Message from Team Owner
        </p>`
              : ``
          }
          ${
            message
              ? `<p
          style="
            font-size: 14px;
            line-height: 10px;
            margin: 0 0 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
              'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
              'Droid Sans', 'Helvetica Neue', sans-serif;
            color: #777;
          "
        >
          ${message}
        </p>`
              : ``
          }
          
          <table
            align="center"
            width="100%"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="margin: 0 0 40px"
          >
            <tbody>
              <tr>
                <td>
                  <a
                    href="${
                      isDevEnv
                        ? "https://senseii-games-git-dev-automation-workz.vercel.app/"
                        : "https://senseiigames.com/"
                    }invitation?token=${token}"
                    style="
                      line-height: 100%;
                      text-decoration: none;
                      display: inline-block;
                      max-width: 100%;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                        'Droid Sans', 'Helvetica Neue', sans-serif;
                      background-color: #1677ff;
                      border-radius: 8px;
                      color: #fff;
                      font-size: 14px;
                      font-weight: 600;
                      text-align: center;
                      width: 200px;
                      padding: 16px 20px 16px 20px;
                    "
                    target="_blank"
                    ><span></span
                    ><span
                      style="
                        max-width: 100%;
                        display: inline-block;
                        line-height: 120%;
                      "
                      >Accept Invitation</span
                    ><span></span
                  ></a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`;
};
