import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Handler } from 'aws-lambda';
import { gzipSync } from 'node:zlib';
import { getFootballApiKey } from './football-api-key.js';
import type { DailyMatchesSnapshot, FootballDataMatchesResponse } from '@wc2026/shared';
import { slimMatchesPayload } from '@wc2026/shared';

const s3Client = new S3Client({});

const bucketName = process.env.ASSETS_BUCKET_NAME ?? 'wc2026-raffle-assets';

const LUIS_FOOTBALL_API_KEY = process.env.LUIS_FOOTBALL_API_KEY ?? '';

/**
 * IANA timezone used to decide when a new "day" starts for daily snapshots.
 * Set ANALYTICS_TIMEZONE on the Lambda (e.g. America/New_York, America/Chicago,
 * America/Los_Angeles, America/Mexico_City, UTC).
 */
const ANALYTICS_TIMEZONE = process.env.ANALYTICS_TIMEZONE ?? 'America/New_York';

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ANALYTICS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

function analyticsDateKey(date = new Date()): string {
  return dateKeyFormatter.format(date);
}

async function saveDailySnapshotIfFirst(
  dateKey: string,
  data: FootballDataMatchesResponse,
  capturedAt: Date
): Promise<{ saved: boolean; key: string }> {
  const key = `snapshots/daily/${dateKey}/matches.json`;

  const snapshotPayload: DailyMatchesSnapshot = {
    schemaVersion: 1,
    date: dateKey,
    timezone: ANALYTICS_TIMEZONE,
    capturedAt: capturedAt.toISOString(),
    matchCount: data.matches.length,
    data
  };

  const body = gzipSync(JSON.stringify(snapshotPayload));

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        CacheControl: 'max-age=31536000, immutable',
        IfNoneMatch: '*',
        Metadata: {
          'analytics-date': dateKey,
          'analytics-timezone': ANALYTICS_TIMEZONE,
          'captured-at': capturedAt.toISOString()
        }
      })
    );

    console.log(`Saved daily snapshot: s3://${bucketName}/${key}`);
    return { saved: true, key };
  } catch (error) {
    if (error instanceof Error && error.name === 'PreconditionFailed') {
      console.log(`Daily snapshot already exists for ${dateKey}, skipping.`);
      return { saved: false, key };
    }

    throw error;
  }
}

export const handler: Handler = async () => {
  try {
    const capturedAt = new Date();
    const dateKey = analyticsDateKey(capturedAt);

    const footballApiKey = await getFootballApiKey();

    const getResponse = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: {
        'X-Auth-Token': footballApiKey,
        'X-Api-Version': 'v4.1',
      }
    });

    if (!getResponse.ok) {
      throw new Error(`GET request failed with status: ${getResponse.status}`);
    }

    const data = (await getResponse.json()) as FootballDataMatchesResponse;
    const slim = slimMatchesPayload(data);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'matches.json',
        Body: gzipSync(JSON.stringify(data)),
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        CacheControl: 'max-age=60'
      })
    );

    console.log('Saved JSON data.');

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'matches-slim.json',
        Body: gzipSync(JSON.stringify(slim)),
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        CacheControl: 'max-age=60'
      })
    );

    console.log('Saved slimmed down JSON data.');

    const snapshot = await saveDailySnapshotIfFirst(dateKey, data, capturedAt);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'HTTP requests completed successfully!',
        analyticsDate: dateKey,
        analyticsTimezone: ANALYTICS_TIMEZONE,
        dailySnapshotSaved: snapshot.saved,
        dailySnapshotKey: snapshot.key
      })
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error occurred:', message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process HTTP requests',
        details: message
      })
    };
  }
};

// Reference parity with backup.mjs — LUIS key reserved for future use.
void LUIS_FOOTBALL_API_KEY;
