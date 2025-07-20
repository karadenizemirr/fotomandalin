import { t } from '../index';
import { router } from '../index';
import { userRouter } from './user';
import { serviceCategoryRouter } from './serviceCategory';
import { packageRouter } from './package';
import { addOnRouter } from './addOn';
import { bookingRouter } from './booking';
import { paymentRouter } from './payment';
import { portfolioRouter } from './portfolio';
import { reviewRouter } from './review';
import { systemSettingsRouter } from './systemSettings';
import { auditLogRouter } from './auditLog';
import { locationRouter } from './location';
import { staffRouter } from './staff';
import { contactRouter } from './contact';
import { announcementRouter } from './announcement';



export const appRouter = t.router({
    user: userRouter,
    serviceCategory: serviceCategoryRouter,
    package: packageRouter,
    addOn: addOnRouter,
    booking: bookingRouter,
    payment: paymentRouter,
    portfolio: portfolioRouter,
    review: reviewRouter,
    systemSettings: systemSettingsRouter,
    auditLog: auditLogRouter,
    location: locationRouter,
    staff: staffRouter,
    contact: contactRouter,
    announcement: announcementRouter,
});

export type AppRouter = typeof appRouter;