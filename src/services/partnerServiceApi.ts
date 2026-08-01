export interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string;
  arnNumber: string;
  status: 'approved' | 'rejected' | 'pending';
  createdAt: string;
  registeredOn: string;
}

export interface PartnerListResponse {
  data: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MOCK_PARTNERS: Partner[] = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9876543210',
    arnNumber: 'ARN-12345',
    status: 'approved',
    createdAt: '2024-01-15T10:30:00Z',
    registeredOn: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '9123456789',
    arnNumber: 'ARN-11223',
    status: 'rejected',
    createdAt: '2024-02-10T14:20:00Z',
    registeredOn: '2024-02-10T14:20:00Z',
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '9988776655',
    arnNumber: 'ARN-99887',
    status: 'pending',
    createdAt: '2024-03-01T09:15:00Z',
    registeredOn: '2024-03-01T09:15:00Z',
  },
  {
    id: 4,
    name: 'Sneha Gupta',
    email: 'sneha.gupta@example.com',
    phone: '8877665544',
    arnNumber: 'ARN-55667',
    status: 'approved',
    createdAt: '2024-02-20T16:45:00Z',
    registeredOn: '2024-02-20T16:45:00Z',
  },
  {
    id: 5,
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '9933221100',
    arnNumber: 'ARN-99112',
    status: 'pending',
    createdAt: '2024-03-05T11:00:00Z',
    registeredOn: '2024-03-05T11:00:00Z',
  },
  {
    id: 6,
    name: 'Pooja Reddy',
    email: 'pooja.reddy@example.com',
    phone: '8866554433',
    arnNumber: 'ARN-44332',
    status: 'approved',
    createdAt: '2024-01-28T13:30:00Z',
    registeredOn: '2024-01-28T13:30:00Z',
  },
  {
    id: 7,
    name: 'Karan Singh',
    email: 'karan.singh@example.com',
    phone: '9955443322',
    arnNumber: 'ARN-33221',
    status: 'rejected',
    createdAt: '2024-02-18T08:00:00Z',
    registeredOn: '2024-02-18T08:00:00Z',
  },
  {
    id: 8,
    name: 'Ananya Pandey',
    email: 'ananya.pandey@example.com',
    phone: '8899776655',
    arnNumber: 'ARN-77665',
    status: 'pending',
    createdAt: '2024-03-10T15:20:00Z',
    registeredOn: '2024-03-10T15:20:00Z',
  },
  {
    id: 9,
    name: 'Vikram Seth',
    email: 'vikram.seth@example.com',
    phone: '9900112233',
    arnNumber: 'ARN-66554',
    status: 'approved',
    createdAt: '2024-01-22T12:00:00Z',
    registeredOn: '2024-01-22T12:00:00Z',
  },
  {
    id: 10,
    name: 'Deepika Joshi',
    email: 'deepika.joshi@example.com',
    phone: '8877665544',
    arnNumber: 'ARN-44331',
    status: 'pending',
    createdAt: '2024-02-14T17:30:00Z',
    registeredOn: '2024-02-14T17:30:00Z',
  },
  {
    id: 11,
    name: 'Manoj Tiwari',
    email: 'manoj.tiwari@example.com',
    phone: '9922334455',
    arnNumber: 'ARN-55443',
    status: 'approved',
    createdAt: '2024-02-25T10:00:00Z',
    registeredOn: '2024-02-25T10:00:00Z',
  },
  {
    id: 12,
    name: 'Kavita Desai',
    email: 'kavita.desai@example.com',
    phone: '8866554433',
    arnNumber: 'ARN-22110',
    status: 'rejected',
    createdAt: '2024-01-30T14:00:00Z',
    registeredOn: '2024-01-30T14:00:00Z',
  },
  {
    id: 13,
    name: 'Sanjay Verma',
    email: 'sanjay.verma@example.com',
    phone: '9911223344',
    arnNumber: 'ARN-00998',
    status: 'pending',
    createdAt: '2024-03-08T09:00:00Z',
    registeredOn: '2024-03-08T09:00:00Z',
  },
  {
    id: 14,
    name: 'Neha Malik',
    email: 'neha.malik@example.com',
    phone: '8877665544',
    arnNumber: 'ARN-88776',
    status: 'approved',
    createdAt: '2024-02-12T11:30:00Z',
    registeredOn: '2024-02-12T11:30:00Z',
  },
  {
    id: 15,
    name: 'Arun Khanna',
    email: 'arun.khanna@example.com',
    phone: '9933221100',
    arnNumber: 'ARN-55001',
    status: 'pending',
    createdAt: '2024-02-28T16:00:00Z',
    registeredOn: '2024-02-28T16:00:00Z',
  },
  {
    id: 16,
    name: 'Madhuri Sen',
    email: 'madhuri.sen@example.com',
    phone: '8855443322',
    arnNumber: 'ARN-55443',
    status: 'rejected',
    createdAt: '2024-01-25T13:00:00Z',
    registeredOn: '2024-01-25T13:00:00Z',
  },
  {
    id: 17,
    name: 'Dinesh Rao',
    email: 'dinesh.rao@example.com',
    phone: '9944556677',
    arnNumber: 'ARN-33220',
    status: 'approved',
    createdAt: '2024-02-18T10:30:00Z',
    registeredOn: '2024-02-18T10:30:00Z',
  },
  {
    id: 18,
    name: 'Sunita Kaur',
    email: 'sunita.kaur@example.com',
    phone: '8877665544',
    arnNumber: 'ARN-66554',
    status: 'pending',
    createdAt: '2024-03-05T14:00:00Z',
    registeredOn: '2024-03-05T14:00:00Z',
  },
  {
    id: 19,
    name: 'Ramesh Chandra',
    email: 'ramesh.chandra@example.com',
    phone: '9922334455',
    arnNumber: 'ARN-22111',
    status: 'approved',
    createdAt: '2024-02-08T09:30:00Z',
    registeredOn: '2024-02-08T09:30:00Z',
  },
  {
    id: 20,
    name: 'Pallavi Shah',
    email: 'pallavi.shah@example.com',
    phone: '8866554433',
    arnNumber: 'ARN-99887',
    status: 'pending',
    createdAt: '2024-02-15T11:00:00Z',
    registeredOn: '2024-02-15T11:00:00Z',
  },
  {
    id: 21,
    name: 'Yogesh Patel',
    email: 'yogesh.patel@example.com',
    phone: '9911223344',
    arnNumber: 'ARN-11223',
    status: 'rejected',
    createdAt: '2024-01-18T10:00:00Z',
    registeredOn: '2024-01-18T10:00:00Z',
  },
  {
    id: 22,
    name: 'Swati Mishra',
    email: 'swati.mishra@example.com',
    phone: '8877665544',
    arnNumber: 'ARN-55667',
    status: 'approved',
    createdAt: '2024-02-22T13:00:00Z',
    registeredOn: '2024-02-22T13:00:00Z',
  },
  {
    id: 23,
    name: 'Nikhil Gupta',
    email: 'nikhil.gupta@example.com',
    phone: '9900112233',
    arnNumber: 'ARN-44332',
    status: 'pending',
    createdAt: '2024-03-02T15:00:00Z',
    registeredOn: '2024-03-02T15:00:00Z',
  },
  {
    id: 24,
    name: 'Rekha Iyer',
    email: 'rekha.iyer@example.com',
    phone: '8899776655',
    arnNumber: 'ARN-77665',
    status: 'approved',
    createdAt: '2024-01-20T12:00:00Z',
    registeredOn: '2024-01-20T12:00:00Z',
  },
  {
    id: 25,
    name: 'Sunil Kumar',
    email: 'sunil.kumar@example.com',
    phone: '9933221100',
    arnNumber: 'ARN-66554',
    status: 'pending',
    createdAt: '2024-02-27T08:00:00Z',
    registeredOn: '2024-02-27T08:00:00Z',
  },
  {
    id: 26,
    name: 'Tina Sen',
    email: 'tina.sen@example.com',
    phone: '8855443322',
    arnNumber: 'ARN-55443',
    status: 'rejected',
    createdAt: '2024-01-30T16:00:00Z',
    registeredOn: '2024-01-30T16:00:00Z',
  },
  {
    id: 27,
    name: 'Ashwin Rao',
    email: 'ashwin.rao@example.com',
    phone: '9944556677',
    arnNumber: 'ARN-33221',
    status: 'approved',
    createdAt: '2024-02-10T14:00:00Z',
    registeredOn: '2024-02-10T14:00:00Z',
  },
  {
    id: 28,
    name: 'Meera Nair',
    email: 'meera.nair@example.com',
    phone: '8866554433',
    arnNumber: 'ARN-22110',
    status: 'pending',
    createdAt: '2024-03-03T10:00:00Z',
    registeredOn: '2024-03-03T10:00:00Z',
  },
  {
    id: 29,
    name: 'Vijay Mehta',
    email: 'vijay.mehta@example.com',
    phone: '9922334455',
    arnNumber: 'ARN-00998',
    status: 'approved',
    createdAt: '2024-02-15T11:00:00Z',
    registeredOn: '2024-02-15T11:00:00Z',
  },
  {
    id: 30,
    name: 'Shruti Singh',
    email: 'shruti.singh@example.com',
    phone: '8877665544',
    arnNumber: 'ARN-88776',
    status: 'pending',
    createdAt: '2024-02-28T09:00:00Z',
    registeredOn: '2024-02-28T09:00:00Z',
  },
];

export async function getPartners(
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<PartnerListResponse> {
  // Simulate async delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = MOCK_PARTNERS;

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (partner) =>
        partner.name.toLowerCase().includes(searchLower) ||
        partner.email.toLowerCase().includes(searchLower) ||
        partner.phone.includes(search) ||
        partner.arnNumber.toLowerCase().includes(searchLower)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function updatePartnerStatus(
  id: number,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; message: string }> {
  // Simulate async delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const partner = MOCK_PARTNERS.find((p) => p.id === id);

  if (!partner) {
    return { success: false, message: 'Partner not found' };
  }

  if (partner.status !== 'pending') {
    return {
      success: false,
      message: 'Partner has already been processed',
    };
  }

  partner.status = status;

  return {
    success: true,
    message: `Partner ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
  };
}
