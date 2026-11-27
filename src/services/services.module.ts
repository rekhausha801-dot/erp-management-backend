import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServiceCategoriesController } from './submodules/service-categories/service-categories.controller';
import { ServiceCategoriesService } from './submodules/service-categories/service-categories.service';
import { ServiceEnquiriesController } from './submodules/service-enquiries/service-enquiries.controller';
import { ServiceEnquiriesService } from './submodules/service-enquiries/service-enquiries.service';
import { ServiceRequestsController } from './submodules/service-requests/service-requests.controller';
import { ServiceRequestsService } from './submodules/service-requests/service-requests.service';
import { ServiceAssignmentsController } from './submodules/service-assignments/service-assignments.controller';
import { ServiceAssignmentsService } from './submodules/service-assignments/service-assignments.service';
import { WorkOrdersController } from './submodules/work-orders/work-orders.controller';
import { WorkOrdersService } from './submodules/work-orders/work-orders.service';
import { WorkProgressController } from './submodules/work-progress/work-progress.controller';
import { WorkProgressService } from './submodules/work-progress/work-progress.service';
import { ServiceCompletionController } from './submodules/service-completion/service-completion.controller';
import { ServiceCompletionService } from './submodules/service-completion/service-completion.service';
import { ServiceReportsController } from './submodules/service-reports/service-reports.controller';
import { ServiceReportsService } from './submodules/service-reports/service-reports.service';

@Module({
  controllers: [
    ServicesController,
    ServiceCategoriesController,
    ServiceEnquiriesController,
    ServiceRequestsController,
    ServiceAssignmentsController,
    WorkOrdersController,
    WorkProgressController,
    ServiceCompletionController,
    ServiceReportsController,
  ],
  providers: [
    ServicesService,
    ServiceCategoriesService,
    ServiceEnquiriesService,
    ServiceRequestsService,
    ServiceAssignmentsService,
    WorkOrdersService,
    WorkProgressService,
    ServiceCompletionService,
    ServiceReportsService,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
