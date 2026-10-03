import { dbStore } from '../apps/api/src/services/db-store';

async function runAcceptanceTest() {
  console.log('====================================================');
  console.log('  SmartWaste 360 - Spatial-Temporal Deduplication Test ');
  console.log('====================================================\n');

  const report1Input = {
    category: 'OVERFLOWING_BIN' as const,
    latitude: 17.7121,
    longitude: 83.3012,
    address: 'Jagadamba Center, Main Gate, Ward 4',
    wardName: 'Ward 4 (Jagadamba)',
    landmark: 'Market Gate',
    description: 'Bin overflowing onto pavement',
    citizenName: 'Citizen A (Ramesh)',
  };

  const report2Input = {
    category: 'OVERFLOWING_BIN' as const,
    latitude: 17.7123, // ~22 meters away from Report 1
    longitude: 83.3013,
    address: 'Jagadamba Center (Opposite Commercial Complex)',
    wardName: 'Ward 4 (Jagadamba)',
    landmark: 'Opposite Store #4',
    description: 'Heavy trash overflowing at market junction',
    citizenName: 'Citizen B (Sita)',
  };

  console.log('[Step 1] Submitting Report 1 at Jagadamba Center...');
  const res1 = dbStore.createReport(report1Input);
  console.log(` -> Report ID: ${res1.report.id}`);
  console.log(` -> Incident ID: ${res1.incident.id}`);
  console.log(` -> Duplicate Flag: ${res1.isDuplicate}`);
  console.log(` -> Linked Reports Count: ${res1.incident.reportsCount}\n`);

  console.log('[Step 2] Submitting Report 2 (22m distance, 2 mins later)...');
  const res2 = dbStore.createReport(report2Input);
  console.log(` -> Report ID: ${res2.report.id}`);
  console.log(` -> Incident ID: ${res2.incident.id}`);
  console.log(` -> Duplicate Flag: ${res2.isDuplicate}`);
  console.log(` -> Linked Reports Count: ${res2.incident.reportsCount}\n`);

  // Assertions
  const isSameIncident = res1.incident.id === res2.incident.id;
  const isDuplicateDetected = res2.isDuplicate === true;
  const reportCountIncremented = res2.incident.reportsCount === 2;

  console.log('====================================================');
  console.log('               ACCEPTANCE VERIFICATION               ');
  console.log('====================================================');
  console.log(`1. Single Incident Shared?    ${isSameIncident ? 'PASS [✓]' : 'FAIL [X]'}`);
  console.log(`2. Duplicate Flagged True?    ${isDuplicateDetected ? 'PASS [✓]' : 'FAIL [X]'}`);
  console.log(`3. Reports Count Incremented? ${reportCountIncremented ? 'PASS [✓]' : 'FAIL [X]'}`);

  if (isSameIncident && isDuplicateDetected && reportCountIncremented) {
    console.log('\n>>> ACCEPTANCE TEST PASSED: No duplicate dispatches generated! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> ACCEPTANCE TEST FAILED <<<');
    process.exit(1);
  }
}

runAcceptanceTest();
