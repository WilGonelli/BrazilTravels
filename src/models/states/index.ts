import { RawDestinationSeed } from '../Destination';
import { AC_DESTINATIONS } from './ac';
import { AL_DESTINATIONS } from './al';
import { AM_DESTINATIONS } from './am';
import { AP_DESTINATIONS } from './ap';
import { BA_DESTINATIONS } from './ba';
import { CE_DESTINATIONS } from './ce';
import { DF_DESTINATIONS } from './df';
import { ES_DESTINATIONS } from './es';
import { GO_DESTINATIONS } from './go';
import { MA_DESTINATIONS } from './ma';
import { MG_DESTINATIONS } from './mg';
import { MS_DESTINATIONS } from './ms';
import { MT_DESTINATIONS } from './mt';
import { PA_DESTINATIONS } from './pa';
import { PB_DESTINATIONS } from './pb';
import { PE_DESTINATIONS } from './pe';
import { PI_DESTINATIONS } from './pi';
import { PR_DESTINATIONS } from './pr';
import { RJ_DESTINATIONS } from './rj';
import { RN_DESTINATIONS } from './rn';
import { RO_DESTINATIONS } from './ro';
import { RR_DESTINATIONS } from './rr';
import { RS_DESTINATIONS } from './rs';
import { SC_DESTINATIONS } from './sc';
import { SE_DESTINATIONS } from './se';
import { SP_DESTINATIONS } from './sp';
import { TO_DESTINATIONS } from './to';

/**
 * Complete consolidated Brazilian destinations catalogue across all 27 Federative Units.
 */
export const ALL_RAW_DESTINATIONS: readonly RawDestinationSeed[] = [
  ...AC_DESTINATIONS,
  ...AL_DESTINATIONS,
  ...AM_DESTINATIONS,
  ...AP_DESTINATIONS,
  ...BA_DESTINATIONS,
  ...CE_DESTINATIONS,
  ...DF_DESTINATIONS,
  ...ES_DESTINATIONS,
  ...GO_DESTINATIONS,
  ...MA_DESTINATIONS,
  ...MG_DESTINATIONS,
  ...MS_DESTINATIONS,
  ...MT_DESTINATIONS,
  ...PA_DESTINATIONS,
  ...PB_DESTINATIONS,
  ...PE_DESTINATIONS,
  ...PI_DESTINATIONS,
  ...PR_DESTINATIONS,
  ...RJ_DESTINATIONS,
  ...RN_DESTINATIONS,
  ...RO_DESTINATIONS,
  ...RR_DESTINATIONS,
  ...RS_DESTINATIONS,
  ...SC_DESTINATIONS,
  ...SE_DESTINATIONS,
  ...SP_DESTINATIONS,
  ...TO_DESTINATIONS,
];

export * from './ac';
export * from './al';
export * from './am';
export * from './ap';
export * from './ba';
export * from './ce';
export * from './df';
export * from './es';
export * from './go';
export * from './ma';
export * from './mg';
export * from './ms';
export * from './mt';
export * from './pa';
export * from './pb';
export * from './pe';
export * from './pi';
export * from './pr';
export * from './rj';
export * from './rn';
export * from './ro';
export * from './rr';
export * from './rs';
export * from './sc';
export * from './se';
export * from './sp';
export * from './to';
